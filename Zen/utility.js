import * as mongoDB from "./mongodb.js";
import {ObjectId} from "mongodb";
import {collections} from "./mongodb.js";

// regex to validate input
const uNameRegEx = new RegExp("^[a-zA-Z0-9]{3,}$"); // validate username
const nameRegEx = new RegExp("^[a-zA-Z]{2,}$");
const emailRegEx = new RegExp("^[a-zA-Z0-9._-]+@([a-zA-Z]+.)+[a-zA-Z]+$"); // validate email
const passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/; // validate password

// checks register data, returns feedback in json
export async function registrationCheck(data) {
    const result = {
        validated: true,
        username: {
            valid: true,
            message: ""
        },
        firstName: {
            valid: true,
            message: ""
        },
        lastName: {
            valid: true,
            message: ""
        },
        middleName: {
            valid: true,
            message: ""
        },
        email: {
            valid: true,
            message: ""
        },
        dob: {
            valid: true,
            message: ""
        },
        city: {
            valid: true,
            message: ""
        },
        country: {
            valid: true,
            message: ""
        },
        password: {
            valid: true,
            message: ""
        },
        confirmPassword: {
            valid: true,
            message: ""
        },
        agreed: data.agreed
    }

    let emptyFlag = "This field must not be empty!";
    let invalidName = "Invalid name format!";

    // get the given username and email to check if they were used
    let uNameElement = await mongoDB.find(collections.users, {"personalDetails.username": data.details.username.toLowerCase()});
    let emailElement = await mongoDB.find(collections.users, {"personalDetails.email": data.details.email.toLowerCase()});

    // agreed with terms and conditions
    if(!result.agreed){
        result.validated = false;
    }
    // check username
    if(data.details.username === "") { // if empty
        result.validated = false;
        result.username.valid = false;
        result.username.message = emptyFlag;
    } else if (!uNameRegEx.test(data.details.username)) { // right format
        result.validated = false;
        result.username.valid = false;
        result.username.message = invalidName;
    } else if (uNameElement.length > 0) { // if already used
        result.validated = false;
        result.username.valid = false;
        result.username.message = "Username already exists!";
    }
    // first name check
    if(data.details.firstName === "") { // if empty
        result.validated = false;
        result.firstName.valid = false;
        result.firstName.message = emptyFlag;
    } else if (!nameRegEx.test(data.details.firstName)) { // if valid format
        result.validated = false;
        result.firstName.valid = false;
        result.firstName.message = invalidName;
    }
    // check last name
    if(data.details.lastName === "") { // if empty
        result.validated = false;
        result.lastName.valid = false;
        result.lastName.message = emptyFlag;
    } else if (!nameRegEx.test(data.details.lastName)) { // if right format
        result.validated = false;
        result.lastName.valid = false;
        result.lastName.message = invalidName;
    }
    // check middle name if not empty and not in the right format
    if(data.details.middleName !== "" && !nameRegEx.test(data.details.middleName)) {
        result.validated = false;
        result.middleName.valid = false;
        result.middleName.message = invalidName;
    }
    // check email
    if(data.details.email === "") { // if empty
        result.validated = false;
        result.email.valid = false;
        result.email.message = emptyFlag;
    } else if (!emailRegEx.test(data.details.email)) { // if invalid format
        result.validated = false;
        result.email.valid = false;
        result.email.message = "Invalid email format!";
    } else if (emailElement.length > 0) { // if already exists
        result.validated = false;
        result.email.valid = false;
        result.email.message = "Email already in use!";
    }

    if(data.details.dob === ""){ // if dob empty
        result.validated = false;
        result.dob.valid = false;
        result.dob.message = "You must select a date of birth!";
    }

    if(data.details.city === "") {
        result.validated = false;
        result.city.valid = false;
        result.city.message = emptyFlag;
    } else if (!nameRegEx.test(data.details.city)) {
        result.validated = false;
        result.city.valid = false;
        result.city.message = "Invalid city format!";
    }

    if(data.details.country === "") {
        result.validated = false;
        result.country.valid = false;
        result.country.message = emptyFlag;
    } else if (!nameRegEx.test(data.details.country)) {
        result.validated = false;
        result.country.valid = false;
        result.country.message = "Invalid country!";
    }

    if(data.details.password === "") { // check password if empty
        result.validated = false;
        result.password.valid = false;
        result.password.message = emptyFlag;
    } else if (!passwordRegEx.test(data.details.password)) { // if the format is right
        result.validated = false;
        result.password.valid = false;
        result.password.message = "Invalid password format!";
    }

    if(data.confirmPassword === "") { // if empty
        result.validated = false;
        result.confirmPassword.valid = false;
        result.confirmPassword.message = emptyFlag;
    } else if (data.details.password !== data.confirmPassword) { // if it does not match
        result.validated = false;
        result.confirmPassword.valid = false;
        result.confirmPassword.message = "Passwords do not match!";
    }

    return result;
}

// checks the data input for edit profile fields, returns feedback in json
export async function editCheck(data){
    const result = {
        needsUpdating: false,
        error: false,
        username: {
            isUpdating: true,
            message: ""
        },
        firstName: {
            isUpdating: true,
            message: ""
        },
        lastName: {
            isUpdating: true,
            message: ""
        },
        middleName: {
            isUpdating: true,
            message: ""
        },
        email: {
            isUpdating: true,
            message: ""
        },
        city: {
            isUpdating: true,
            message: ""
        },
        country: {
            isUpdating: true,
            message: ""
        },
        bio: {
            isUpdating: true,
            message: ""
        }
    }
    let invalidName = "Invalid name format!";
    let emailElement = await mongoDB.find (mongoDB.collections.users, {"personalDetails.email": data.email});

    if(data.firstName !== "") {
        if(!nameRegEx.test(data.firstName)) {
            result.error = true;
            result.firstName.isUpdating = false;
            result.firstName.message = invalidName;
        } else {
            result.needsUpdating = true;
        }
    } else {
        result.firstName.isUpdating = false;
        result.firstName.message = "";
    }

    if(data.lastName !== "") {
        if(!nameRegEx.test(data.lastName)) {
            result.error = true;
            result.lastName.isUpdating = false;
            result.lastName.message = invalidName;
        } else {
            result.needsUpdating = true;
        }
    } else {
        result.lastName.isUpdating = false;
        result.lastName.message = "";
    }

    if(data.middleName !== "") {
        if(!nameRegEx.test(data.middleName)) {
            result.error = true;
            result.middleName.isUpdating = false;
            result.middleName.message = invalidName;
        } else {
            result.needsUpdating = true;
        }
    } else {
        result.middleName.isUpdating = false;
        result.middleName.message = "";
    }

    if(data.email !== "") {
        if (!emailRegEx.test(data.email)) {
            result.error = true;
            result.email.isUpdating = false;
            result.email.message = "Invalid email format!";
        } else if (emailElement.length > 0) {
            result.error = true;
            result.email.isUpdating = false;
            result.email.message = "Email already in use!";
        } else {
            result.needsUpdating = true;
        }
    } else {
        result.email.isUpdating = false;
        result.email.message = "";
    }

    if(data.city !== "") {
        if(!nameRegEx.test(data.city)) {
            result.error = true;
            result.city.isUpdating = false;
            result.city.message = "Invalid city format!";
        } else {
            result.needsUpdating = true;
        }
    } else {
        result.city.isUpdating = false;
        result.city.message = "";
    }

    if(data.country !== "") {
        if(!nameRegEx.test(data.country)) {
            result.error = true;
            result.country.isUpdating = false;
            result.country.message = "Invalid country format!";
        } else {
            result.needsUpdating = true;
        }
    } else {
        result.country.isUpdating = false;
        result.country.message = "";
    }

    if(data.biography === ""){
        result.bio.isUpdating = false;
        result.bio.message = "";
    } else {
        result.needsUpdating = true;
    }

    return result;
}

// updates the changes in the profile section based on the feedback above
export function amendChanges(data, result, updatedData) {
    updatedData = JSON.parse(updatedData.myData);
    if(result.needsUpdating) {
        if(result.firstName.isUpdating) {
            data.personalDetails.firstName = updatedData.firstName;
        }
        if(result.lastName.isUpdating) {
            data.personalDetails.lastName = updatedData.lastName;
        }
        if(result.middleName.isUpdating) {
            data.personalDetails.middleName = updatedData.middleName;
        }
        if(result.email.isUpdating) {
            data.personalDetails.email = updatedData.email;
        }
        if(result.city.isUpdating) {
            data.personalDetails.city = updatedData.city;
        }
        if(result.country.isUpdating) {
            data.personalDetails.country = updatedData.country;
        }
        if(result.bio.isUpdating) {
            data.biography = updatedData.biography;
        }
        if(result.image !== null) {
            data.personalDetails.profilePicture = result.image;
        }
    }
    return data;
}

// returns name in a certain format
export function getNameFormat(data) {
    let name = data.personalDetails.firstName + " ";
    if(data.personalDetails.middleName !== "") {
        name += data.personalDetails.middleName.charAt(0) + ". ";
    }
    name += data.personalDetails.lastName;

    return name;
}

// get the time in a certain format
export function getTimeFormat(data) {
    let elements = data.dateTime.split(" ");
    let timeElements = elements[4].split(":");
    return elements[1]+" "+elements[2]+" "+elements[3]+" "+timeElements[0] +":"+timeElements[1];
}

export async function getFollowingData(arrayIDs){
    let data = [];
    for(const id of arrayIDs) {
        let users = await mongoDB.find(collections.users, {_id: new ObjectId(id)});
        if(users.length !== 0){
            data.push({
                name: getNameFormat(users[0]),
                _id: users[0]._id,
                profilePicture: users[0].personalDetails.profilePicture,
            });
        }
    }
    return data;
}

// returns array of post data from an array of post ids
export async function getArrayOfPosts(loggedInUser, user) {
    let arrayOfPosts = [];
    for (const post of user.posts) {
        let aPost = await mongoDB.find(mongoDB.collections.posts, { _id: new ObjectId(post) });
        if(aPost.length !== 0) {
            aPost[0].hasLiked = aPost[0].likes.includes(loggedInUser._id);
            aPost[0].formattedTime = getTimeFormat(aPost[0]);
            aPost[0].profilePicture = user.personalDetails.profilePicture;
            arrayOfPosts.push(aPost[0]);
        }
    }
    return arrayOfPosts;
}

export function sortArrayOfPostsByTime(array) {
    return array.sort(function (a, b) {
        const timeA = new Date(a.dateTime);
        const timeB = new Date(b.dateTime);
        return timeB - timeA;
    })
}

export function isImageFile(filename) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = filename.split(".");
    let lastIndex = ext.length - 1;
    return imageExtensions.includes("." + ext[lastIndex].toLowerCase());
}