import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import * as mongoDB from "./mongodb.js";
import * as utilities from "./utility.js";
import {ObjectId} from "mongodb";

// configuring the webservice
const app = express();
const port = 8080;
const STUDENT_ID = 'M00910464';

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use(session({
    secret: STUDENT_ID,
    cookie: { maxAge: 30 * 60 * 60 * 1000 },
    resave: true,
    saveUninitialized: true,
}));
app.use(bodyParser.json());
app.use(fileUpload());

// get data for home page, such as personal data, posts and people following
app.get(`/${STUDENT_ID}/home`, async (req, res) => {
    // intialise the JSON to be returned
    const toReturn = {
        personalData: {
            name: utilities.getNameFormat(req.session.user),
            username: req.session.user.personalDetails.username,
            city: req.session.user.personalDetails.city,
            followersNo: req.session.user.followers.length,
            followingNo: req.session.user.following.length,
            profilePicture: req.session.user.personalDetails.profilePicture,
        },
        following: await utilities.getFollowingData(req.session.user.following),
        posts: [],
    }

    // iterate the array of people the user is following
    for (const item of toReturn.following) {
        let user = await mongoDB.find(mongoDB.collections.users, { _id: new ObjectId(item._id) });

        // if the user is found
        if(user.length !== 0) {
            for(const post of await utilities.getArrayOfPosts(req.session.user, user[0])) {
                toReturn.posts.push(post);
            }
        }
    }
    for(const aPost of await utilities.getArrayOfPosts(req.session.user, req.session.user)) {
        toReturn.posts.push(aPost);
    }
    // sort array by time
    toReturn.posts = utilities.sortArrayOfPostsByTime(toReturn.posts);

    res.send(toReturn);
});

app.post(`/${STUDENT_ID}/otherProfile`, async (req, res) => {
    let users = await mongoDB.find(mongoDB.collections.users, { _id: new ObjectId(req.body._id) });
    if(users.length !== 0) {
        let aUser = users[0];
        // intialise the JSON to be returned
        const toReturn = {
            name: utilities.getNameFormat(aUser),
            username: aUser.personalDetails.username,
            city: aUser.personalDetails.city,
            followersNo: aUser.followers.length,
            followingNo: aUser.following.length,
            biography: aUser.biography,
            isFollowing: aUser.followers.map(id => id.toString()).includes(req.session.user._id.toString()),
            isLoggedInUser: aUser._id.toString() === req.session.user._id.toString(),
            posts: [],
            profilePicture: aUser.personalDetails.profilePicture,
        }
        // get posts of the user
        toReturn.posts = await utilities.getArrayOfPosts(req.session.user, aUser);
        // sort them by time
        toReturn.posts = utilities.sortArrayOfPostsByTime(toReturn.posts);
        res.send(toReturn);
    } else {
        res.send({error: true})
    }
});

// get data for home page, such as personal data, posts and people following
app.get(`/${STUDENT_ID}/profile`, (req, res) => {
    const toReturn = {};
    toReturn.firstName = req.session.user.personalDetails.firstName;
    toReturn.lastName = req.session.user.personalDetails.lastName;
    toReturn.middleName = req.session.user.personalDetails.middleName;
    toReturn.city = req.session.user.personalDetails.city;
    toReturn.country = req.session.user.personalDetails.country;
    toReturn.name = utilities.getNameFormat(req.session.user);
    toReturn.username = req.session.user.personalDetails.username;
    toReturn.location = req.session.user.personalDetails.city + " " + req.session.user.personalDetails.country;
    toReturn.biography = req.session.user.biography;
    toReturn.email = req.session.user.personalDetails.email;
    toReturn.dob = req.session.user.personalDetails.dob;
    toReturn.picture = req.session.user.personalDetails.profilePicture;
    res.send(toReturn);
})

// get comments of a post
app.post(`/${STUDENT_ID}/getComments`, async (req, res) => {
    // find the post
    let posts = await mongoDB.find(mongoDB.collections.posts, { _id: new ObjectId(req.body.postID) });
    // check if it's been found
    if(posts.length !== 0){
        let aPost = posts[0];
        let arrayOfComments = [];

        // iterate the array of comments ids
        for(const comment of aPost.comments) {
            // search it in mongoDB
            let comments = await mongoDB.find(mongoDB.collections.comments, { _id: comment });

            // if found, return the necessary data
            if (comments.length !== 0) {
                let aComment = comments[0];
                let toReturn = {};
                toReturn.hasLiked = aComment.likes.includes(req.session.user._id);
                toReturn.text = aComment.text;
                toReturn.likes = aComment.likes.length;
                toReturn.id = aComment._id;
                toReturn.time = utilities.getTimeFormat({dateTime: aComment.dateTime});

                let users = await mongoDB.find(mongoDB.collections.users, { _id: new ObjectId(aComment.postedBy) });
                if(users.length !== 0) {
                    toReturn.name = utilities.getNameFormat(users[0]);
                    toReturn.profilePicture = users[0].personalDetails.profilePicture;
                }

                // add it in the array
                arrayOfComments.push(toReturn);
            }
        }

        res.send({comments: arrayOfComments});
    } else {
        res.send({"message": "the post of was not found"});
    }
})

// post for new user data
app.post(`/${STUDENT_ID}/new-user`, async(req, res) => {
    // based on the data given, process the inputs
    let result = await utilities.registrationCheck(req.body);

    console.log({
        "message": "Data received for registration",
        "data": req.body
    })

    // is is not validated
    if (!result.validated) {
        res.send(result);
    } else {
        // save the data in mongodb
        const data = {
            following: [],
            followers: [],
            posts: [],
            personalDetails: req.body.details,
            biography: "Hi! I'm new to Zen."
        }

        await mongoDB.insert(mongoDB.collections.users, data);

        res.send(result);
    }
})

// post for new post data
app.post(`/${STUDENT_ID}/new-post`, async(req, res) => {
    // post format to be saved in db
    let newPost = {
        comments: [],
        image: null,
        likes: [],
        text: req.body.text,
        postedByName: utilities.getNameFormat(req.session.user),
        postedBy: req.session.user.personalDetails.username,
        profilePicture: req.session.user.personalDetails.profilePicture,
        dateTime: new Date().toString()
    }
    // if there are no files included
    if(!req.files || Object.keys(req.files).length === 0) {
    } else { // if there are files, set it
        newPost.image = req.files.myFile.name;
    }

    // if an image was attached, move it in the relevant folder
    if(newPost.image !== null) {
        if(utilities.isImageFile(newPost.image)) {
            // move the file to uploads folder
            await req.files.myFile.mv('./public/assets/uploads/posts/' + req.files.myFile.name, function (err) {
                if (err) {
                    return res.status(500).send({
                        "filename": req.files.name,
                        "upload": false,
                        "error": JSON.stringify(err)
                    })
                }
            });
            // set the path to the image
            newPost.image = `assets/uploads/posts/` + req.files.myFile.name;
        } else {
              res.send({"error": true, "message": "Not an image file."});
              return;
        }
    }

    // add the post in db
    let newPostId = await mongoDB.insert(mongoDB.collections.posts, newPost);

    // add the post id in the array of posts in the users db entry
    req.session.user.posts.push(new ObjectId(newPostId));

    // update the user in the db collection
    await mongoDB.update(mongoDB.collections.users,
        {"personalDetails.username": req.session.user.personalDetails.username},
        {$set: {"posts": req.session.user.posts}});

    newPost.hasLiked = false;
    newPost.formattedTime = utilities.getTimeFormat({dateTime: newPost.dateTime});

    res.send({
        "posted": true,
        post: newPost
    });
})

// put method for new comment data
app.post(`/${STUDENT_ID}/new-comment`, async(req, res) => {
    let posts = await mongoDB.find(mongoDB.collections.posts, { _id: new ObjectId(req.body.postID) });
    // if post found
    if(posts.length !== 0) {
        let aPost = posts[0];
        let result = { "message": "Comment received", "commentNo": aPost.comments.length, comment: {} };

        // comment format to be saved in db
        let newComment = {
            text: req.body.postText,
            likes: [],
            post: aPost._id,
            postedBy: req.session.user._id,
            dateTime: new Date().toString()
        }
        result.comment.hasLiked = newComment.likes.includes(req.session.user._id);
        result.comment.name = utilities.getNameFormat(req.session.user);
        result.comment.profilePicture = req.session.user.personalDetails.profilePicture;
        result.comment.text = newComment.text;
        result.comment.likes = newComment.likes.length;
        result.comment.id = newComment._id;
        result.comment.time = utilities.getTimeFormat({dateTime: newComment.dateTime});
        // save to db
        let newCommentId = await mongoDB.insert(mongoDB.collections.comments, newComment);

        // save the comment in the post's array of comment ids
        aPost.comments.push(newCommentId);

        // update the post in db
        await mongoDB.update(mongoDB.collections.posts, { _id: aPost._id }, {$set: {comments: aPost.comments}});

        res.send(result);
    } else {
        res.send({"message": "the post of was not found"});
    }
});

// post method to log in a user
app.post(`/${STUDENT_ID}/login`, async (req, res) => {
    let userDetails = req.body;

    console.log({
        "message": "Data received for log-in",
        "data": req.body
    })

    // get the user from db
    let userSearch = await mongoDB.find(mongoDB.collections.users,{"personalDetails.username": userDetails.username.toLowerCase()});

    // if data was found and the given data matches
    if (userSearch.length > 0) {
        if(userSearch[0].personalDetails.username === userDetails.username && userSearch[0].personalDetails.password === userDetails.password) {
            req.session.user = userSearch[0];
            res.send({"valid": true, "message": "Login successfully!"});
        } else {
            res.send({"valid": false, "message": "Username or password is invalid!"});
        }
    } else { // if did not match
        res.send({"valid": false, "message": `No user found!` });
    }
})

// method to check the login of the user
app.get(`/${STUDENT_ID}/check-login`, (req, res) => {
    // check if the user is logged-in
    if(!("user" in req.session)) {
        res.send({"login": false });
    } else {
        res.send({"login": true, "username": req.session.user.personalDetails.username});
    }
})

// logs out an user
app.get(`/${STUDENT_ID}/logout`, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.send({"error": err});
        } else {
            res.send({"login": false, "message": "logged-out"});
        }
    });
})

// post method to edit personal details of an user
app.post(`/${STUDENT_ID}/editProfileData`, async(req, res) => {
    // performing an input check similar to registration check
    let result = await utilities.editCheck(JSON.parse(req.body.myData));
    result.image = null;

    // if there are no files included
    if(!req.files || Object.keys(req.files).length === 0) {
    } else { // if there are files, set it
        result.image = req.files.myFile.name;
        result.needsUpdating = true;
    }

    // if an image was attached, move it in the relevant folder
    if(result.image !== null) {
        if(utilities.isImageFile(result.image)) {
            // move the file to uploads folder
            await req.files.myFile.mv('./public/assets/uploads/profile/' + req.files.myFile.name, function (err) {
                if (err) {
                    return res.status(500).send({
                        "filename": req.files.name,
                        "upload": false,
                        "error": JSON.stringify(err)
                    })
                }
            });
            result.image = 'assets/uploads/profile/' + req.files.myFile.name;
            result.notAnImage = false;
        } else {
            result.error = true;
            result.notAnImage = true;
        }
    }

    if(result.error) { // if error occurred
        res.send(result);
    } else if(result.needsUpdating) { // if the data needs to be updated
        req.session.user = utilities.amendChanges(req.session.user, result, req.body);
        req.session.user._id = new ObjectId(req.session.user._id);
        console.log(req.session.user);
        await mongoDB.replace(mongoDB.collections.users, req.session.user);
        res.send(result);
    } else {
        res.send(result);
    }
})

// search for users
app.post(`/${STUDENT_ID}/search-users`, async(req, res) => {
    // to ignore cases
    let regexPattern = new RegExp(req.body.search, 'i');

    // search by all types of name
    let results = await mongoDB.find (mongoDB.collections.users, {$or: [
            {"personalDetails.username": {$regex: regexPattern},},
            {"personalDetails.firstName": {$regex: regexPattern},},
            {"personalDetails.lastName": {$regex: regexPattern},},
            {"personalDetails.middleName": {$regex: regexPattern},},
        ]});

    let toReturn = [];
    // iterate and add to array differently formatted json
    for(let idx = 0; idx < results.length; idx++) {

        // to be returned to front end
        const aMatch = {
            name: utilities.getNameFormat(results[idx]),
            username: results[idx].personalDetails.username,
            isFollowing: req.session.user.following.includes(results[idx]._id.toString()),
            isLoggedInUser: new ObjectId(req.session.user._id).equals(results[idx]._id),
            profilePicture: results[idx].personalDetails.profilePicture,
            _id: results[idx]._id,
        }

        // add to array
        toReturn.push(aMatch);
    }

    // send the response
    if(toReturn.length > 0){
        res.send({
            dataFound: true,
            data: toReturn,
        })
    } else {
        res.send({
            dataFound: false,
            message: "No results!",
        })
    }
})

app.post(`/${STUDENT_ID}/search-posts`, async(req, res) => {
    // to ignore cases
    // Word to search for
    const searchWord = req.body.search;
    // remove punctuation marks from the search word
    const sanitizedSearchWord = searchWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");

    let regexPattern = new RegExp(`\\b${sanitizedSearchWord}\\b`, 'i');
    let posts = await mongoDB.find(mongoDB.collections.posts, {"text": {$regex: regexPattern}});
    let toReturn = [];

    for(const post of posts) {
        post.hasLiked = post.likes.includes(req.session.user._id);
        post.formattedTime = utilities.getTimeFormat(post);
        toReturn.push(post);
    }

    toReturn = utilities.sortArrayOfPostsByTime(toReturn);
    res.send({"posts": toReturn, "dataFound": posts.length > 0});
})

// follow or unfollow a user
app.post(`/${STUDENT_ID}/followUnfollow`, async (req, res) => {
    let users = await mongoDB.find(mongoDB.collections.users, { "personalDetails.username": req.body.username });
    if(users.length > 0) {
        let aUser = users[0];
        let result = {"successful": true};
        if(req.session.user.following.includes(aUser._id.toString())) { // unfollow
            req.session.user.following = req.session.user.following.filter(function(item) {
                return item !== aUser._id.toString();
            });
            aUser.followers = aUser.followers.filter(function(item) {
                return item !== req.session.user._id.toString();
            })
            result.isFollowing = false;
        } else { // follow
            req.session.user.following.push(aUser._id.toString());
            aUser.followers.push(req.session.user._id.toString());
            result.isFollowing = true;
        }
        await mongoDB.update(mongoDB.collections.users, {_id: new ObjectId(req.session.user._id)} ,{$set: {following: req.session.user.following}});
        await mongoDB.update(mongoDB.collections.users, {_id: new ObjectId(aUser._id)} ,{$set: {followers: aUser.followers}});
        result.following = await utilities.getFollowingData(req.session.user.following);

        res.send(result);
        return;
    }

    res.send({"successful": false});
});

// put method for liking a post or a comment
app.post(`/${STUDENT_ID}/like`, async (req, res) => {
    let objects;
    let result = {
        liked: false,
        likesNo: 0,
    }
    let collection;

    // check if the user is interacting with a post or a comment
    if(req.body.interactingWithPost){
        collection = mongoDB.collections.posts;
        objects = await mongoDB.find(collection, { _id: new ObjectId(req.body.ID) });
        result.interactingWithPost = true;
        result.interactingWithComment = false;
    } else if (req.body.interactingWithComment){
        collection = mongoDB.collections.comments;
        objects = await mongoDB.find(collection, { _id: new ObjectId(req.body.ID) });
        result.interactingWithPost = false;
        result.interactingWithComment = true;
    }

    // if an object was found, either post or comment
    if (objects.length !== 0) {
        let obj = objects[0];

        // check if the user already likes the post
        if (obj.likes.includes(req.session.user._id)) {
            // remove the person, unfollow
            obj.likes = obj.likes.filter(function(item) {
                return item !== req.session.user._id;
            });
        } else { // if not push the id
            obj.likes.push(req.session.user._id);
            result.liked = true;
        }
        result.likesNo = obj.likes.length;

        // update the db entry
        await mongoDB.update(collection, {_id: obj._id}, {$set: {likes: obj.likes}});
    }

    res.send(result);
})

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});