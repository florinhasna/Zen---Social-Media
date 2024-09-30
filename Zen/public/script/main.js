// object containing states

const states = {
    LOGIN: "login-page",
    REGISTER: "register-page",
    HOME: "home-page",
    PROFILE: "profile-page",
    OTHERS: "view-profile" // other user profile page
};

let isAgreeing = false;

// initial state
let state = states.LOGIN;
let commentButton = null;

// getting the required IDs
let searchBar = document.getElementById('searchBar');
let menuBar = document.getElementById('menuBar');
let homeSection = document.getElementById('homeSection');
let registerSection = document.getElementById('registerSection');
let loginSection = document.getElementById('loginSection');
let profileSection = document.getElementById('profileSection');
let otherProfiles = document.getElementById('viewProfilesSections');
document.getElementById('centralBoxHome').style.display = 'none';

// to swap pages
function pageSwap(state) {
    // initially hide all elements
    searchBar.style.display = 'none';
    menuBar.style.display = 'none';
    homeSection.style.display = 'none';
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    profileSection.style.display = 'none';
    otherProfiles.style.display = 'none';
    document.getElementById('leftSideContainer').remove;
    document.getElementById('rightSideContainer').remove;

    // check states and display element accordingly

    if (state === states.LOGIN) {
        loginSection.style.display = 'block';
        return;
    }

    if (state === states.REGISTER) {
        registerSection.style.display = 'block';
        return;
    }

    // when the user is logged in, display searchbar and navbar
    searchBar.style.display = 'block';
    menuBar.style.display = 'block';

    if (state === states.HOME) {
        window.addEventListener("DOMContentLoaded", loadHome());
    }

    // logged in user profile
    if (state === states.PROFILE) {
        profileSection.style.display = 'block';
        loadProfileData();
    }
    // other user profile
    if (state === states.OTHERS) {
        otherProfiles.style.display = 'block';
    }
}

// not fully functional, but is designed to give functionality to backward, forward browser buttons
window.addEventListener("popstate", function (event) {
    pageSwap(event.state);
});

// load initial pageSwap
pageSwap(state);


/* REGISTER RELATED FUNCTIONS */


// to load register page
function goToRegister() {
    history.pushState(states.REGISTER, undefined); // Update browser history
    state = states.REGISTER; // Set internal state to REGISTER
    pageSwap(state); // Trigger page swap
}

// get data from input fields and register a user
function register() {
    const data = {
        details: {
            username: document.querySelector('#registerUsername').value,
            firstName: document.querySelector('#registerFirstName').value,
            lastName: document.querySelector('#registerLastName').value,
            middleName: document.querySelector('#registerMiddleName').value,
            email: document.querySelector('#registerEmail').value,
            dob: document.querySelector('#registerDob').value,
            city: document.querySelector('#registerCity').value,
            country: document.querySelector('#registerCountry').value,
            password: document.querySelector('#registerPassword').value,
            profilePicture: "assets/uploads/profile/default.png",
        },
        confirmPassword: document.querySelector('#registerPasswordConfirm').value,
        agreed: isAgreeing,
    };

    let response = postJSON("new-user", data);
    // check the response and act accordingly
    response.then((res) => {
        console.log(res)
        if(res.validated){
            goToLogin();
            document.getElementById('registerForm').reset();
            displayRegistrationErrors(res); // will hide the tooltips
        } else {
            displayRegistrationErrors(res);
        }
    })
}

// when the agree terms and conditions box is ticked
function agree() {
    isAgreeing = true;
}

// display errors of the feed-back received from the server
function displayRegistrationErrors(res) {
    if(res.validated) {
        document.getElementById('registerValidationMessage').style.display = 'block';
        document.getElementById('registerValidationMessage').style.color = '#00ff00';
        document.getElementById('registerValidationMessage').innerHTML = 'Registration successful, redirecting...';
        document.getElementById('registerValidationMessage').style.display = 'none';
    } else {
        document.getElementById('registerValidationMessage').style.display = 'block';
        document.getElementById('registerValidationMessage').style.color = '#ff0000';
        document.getElementById('registerValidationMessage').innerHTML = 'Registration unsuccessful ...';
    }

    if(!res.username.valid){
        document.getElementById('usernameToolTip').style.display = 'block';
        document.getElementById('usernameToolTip').innerHTML = res.username.message;
    } else {
        document.getElementById('usernameToolTip').style.display = 'none';
    }

    if(!res.firstName.valid){
        document.getElementById('firstNameToolTip').style.display = 'block';
        document.getElementById('firstNameToolTip').innerHTML = res.firstName.message;
    } else {
        document.getElementById('firstNameToolTip').style.display = 'none';
    }

    if(!res.lastName.valid){
        document.getElementById('lastNameToolTip').style.display = 'block';
        document.getElementById('lastNameToolTip').innerHTML = res.lastName.message;
    } else {
        document.getElementById('lastNameToolTip').style.display = 'none';
    }

    if(!res.middleName.valid){
        document.getElementById('middleNameToolTip').style.display = 'block';
        document.getElementById('middleNameToolTip').innerHTML = res.middleName.message;
    } else {
        document.getElementById('middleNameToolTip').style.display = 'none';
    }

    if(!res.email.valid){
        document.getElementById('emailToolTip').style.display = 'block';
        document.getElementById('emailToolTip').innerHTML = res.email.message;
    } else {
        document.getElementById('emailToolTip').style.display = 'none';
    }

    if(!res.dob.valid){
        document.getElementById('dobToolTip').style.display = 'block';
        document.getElementById('dobToolTip').innerHTML = res.dob.message;
    } else {
        document.getElementById('dobToolTip').style.display = 'none';
    }

    if(!res.city.valid){
        document.getElementById('cityToolTip').style.display = 'block';
        document.getElementById('cityToolTip').innerHTML = res.city.message;
    } else {
        document.getElementById('cityToolTip').style.display = 'none';
    }

    if(!res.country.valid){
        document.getElementById('countryToolTip').style.display = 'block';
        document.getElementById('countryToolTip').innerHTML = res.country.message;
    } else {
        document.getElementById('countryToolTip').style.display = 'none';
    }

    if(!res.password.valid){
        document.getElementById('passwordToolTip').style.display = 'block';
        document.getElementById('passwordToolTip').innerHTML = res.password.message;
    } else {
        document.getElementById('passwordToolTip').style.display = 'none';
    }

    if(!res.confirmPassword.valid){
        document.getElementById('passwordConfirmToolTip').style.display = 'block';
        document.getElementById('passwordConfirmToolTip').innerHTML = res.confirmPassword.message;
    } else {
        document.getElementById('passwordConfirmToolTip').style.display = 'none';
    }

    if(!res.agreed) {
        document.getElementById('agreeTermsLabel').style.color = '#ff0000';
    } else {
        document.getElementById('agreeTermsLabel').style.color = '#000000';
    }
}

// to show the password in the register input fields
function showRegisterPassword(){
    if(document.getElementById('registerPassword').type === "password"){
        document.getElementById('registerPassword').type = "text";
        document.getElementById('registerPasswordConfirm').type = "text";
    } else {
        document.getElementById('registerPassword').type = "password";
        document.getElementById('registerPasswordConfirm').type = "password";
    }
}


/* LOGIN RELATED FUNCTIONS */


// to load login page
function goToLogin() {
    history.pushState(states.LOGIN, undefined); // Update browser history
    state = states.LOGIN; // Set internal state to LOG IN
    pageSwap(state); // Trigger page swap
}

// gets data from input fields
function login() {
    const data = {
        username: document.querySelector('#loginUsername').value,
        password: document.querySelector('#loginPassword').value
    }

    let response = postJSON("login", data);

    response.then((res) => {
        let loginResponse =  getJSON("check-login");

        loginResponse.then((r) => {
            console.log(r);

            if(r.login) {
                document.getElementById('loginValidationMessage').style.display = 'block';
                document.getElementById('loginValidationMessage').style.color = '#00ff00';
                document.getElementById('loginValidationMessage').innerHTML = res.message;
                document.getElementById('loginForm').reset();
                history.pushState(state, undefined); // Update browser history
                state = states.HOME; // Set internal state to HOME
                pageSwap(state); // Trigger page swap
                document.getElementById('loginValidationMessage').style.display = 'none';
            } else {
                document.getElementById('loginValidationMessage').style.display = 'block';
                document.getElementById('loginValidationMessage').style.color = '#ff0000';
                document.getElementById('loginValidationMessage').innerHTML = res.message;
            }
        });
    });
}

// Function triggered when the logout button is clicked
async function logout() {
    let logout = getJSON("logout");
    // handle the promise, check the response
    logout.then((res) => {
        if(!res.login){ // logout
            state = states.LOGIN; // Set internal state to LOG IN
            pageSwap(state); // Trigger page swap
        }
    });
}


/* HOME PAGE RELATED FUNCTIONS */


function loadHome() {
    // remove data loaded previously
    clearDataOfAnElement(document.getElementById('postsField'));
    homeSection.style.display = 'block';
    let homeData = getJSON("home");
    homeData.then((r) => {
        document.getElementById('centralBoxHome').style.display = 'block';
        document.getElementById('leftSideContainer').innerHTML = getLeftSideBox(r.personalData);
        document.getElementById('rightSideContainer').innerHTML = getRightSideBox(r.following);
        for (const post of r.posts) {
            document.getElementById('postsField').appendChild(newPost(post));
        }
    });
}

function updateFollowing(data){
    document.getElementById('rightSideContainer').innerHTML = getRightSideBox(data);
    document.querySelector('.followingSpan').innerHTML = data.length;
}

// Function triggered when the home button is clicked
function homeButtonClick() {
    history.pushState(state, undefined); // Update browser history
    state = states.HOME; // Set internal state to HOME
    pageSwap(state); // Trigger page swap
}

// returns left side box of a section, used to display user data
function getLeftSideBox(data) {
    console.log(data)
    return `<div class="container-fluid leftBox" id="leftSideBox">
    <!-- Inner row div -->
    <div class="container-fluid row">
        <!-- First column -->
        <div class="col-md-3 me-5">
            <!-- Image element -->
            <img src="${data.profilePicture}" class="mt-1 profileImage" alt="">
        </div>
        <!-- Second column -->
        <div class="col-md">
            <!-- Paragraphs for profile information -->
            <p class="mt-2 profileName">${data.name}</p>
            <p class="profileText">${data.username}</p>
            <p class="profileText">${data.city}</p>
        </div>
        <!-- Div for follower and following information -->
        <div>
            <!-- Paragraphs for followers and following -->
            <p>Followers: <span class="followersSpan">${data.followersNo}</span></p>
            <p>Following: <span class="followingSpan">${data.followingNo}</span></p>
        </div>
    </div>
</div>
`;
}

// to generate the right side box of a section, used to display people the user is following
function getRightSideBox(arrayFollowing) {
    let toReturn = `<p class="rightBoxHeader mt-2">People You Follow</p><hr>`;
    const LIMIT = 10; // Define a limit for the number of displayed items
    for (const following of arrayFollowing) {
        if (arrayFollowing.indexOf(following) < LIMIT) {
            toReturn += generateUsernameFollowing(following);
        }
    }
    toReturn += `<hr>`;
    return toReturn;
}

// function recursively called to generate element holding user image and username box
function generateUsernameFollowing(user) {
    return `<div class="row followingFriendDiv" onclick="loadOtherProfile(this.querySelector('input').value)">
                <div class="col-md-4">
                    <img class="homeRightSidePicture" src=${user.profilePicture} alt="">
                </div>
                <div class="col-md mt-3">
                    <p style="font-size: 18px; margin-left: -20px;;" id="name">${user.name}</p>
                </div>
                <input type="hidden" value="${user._id}">
            </div>`;
}

// creates a new post
async function createPost() {
    let fileArray = document.getElementById('postFile').files;
    const formData = new FormData();
    formData.append('myFile', fileArray[0]);
    formData.append('text', document.querySelector('#postTextArea').value);
    if(document.querySelector('#postTextArea').value === ''){
        document.querySelector('#postTextArea').style.backgroundColor = '#ffcccb';
        return;
    }

    let response = postWithFile("new-post", formData);
    response.then((res) => {
        if(res.error) {
            document.getElementById('newPostFileTooltip').style.display = 'block';
            document.getElementById('newPostFileTooltip').innerHTML = res.message;
        } else {
            document.getElementById('newPostFileTooltip').style.display = 'none';
            document.getElementById('postsField').insertBefore(newPost(res.post), document.getElementById('postsField').firstChild);
            document.getElementById('postForm').reset();
        }
    });
}

// to show the password in the login input field
function showLoginPassword(){
    if(document.getElementById('loginPassword').type === "password"){
        document.getElementById('loginPassword').type = "text";
    } else {
        document.getElementById('loginPassword').type = "password";
    }
}


/* EDIT PAGE RELATED FUNCTIONS */


function loadProfile(user) {
    // Set the text content with profile name
    document.getElementById('profileName').innerHTML = user.name;
    // Set content with username
    document.getElementById('profileUsername').innerHTML = "@" + user.username;
    // Set location content
    document.getElementById('profileLocation').innerHTML = user.location.replace(" ", ", ");
    // Set biography content
    document.getElementById('profileBiography').innerHTML = user.biography;
    // Set email content
    document.getElementById('profileEmail').innerHTML = 'E-Mail: ' + user.email;
    // Set date of birth content
    document.getElementById('profileDOB').innerHTML = 'Date of Birth: ' + user.dob;
    document.getElementById('settingsProfilePicture').innerHTML = `<img class="mt-2 settingProfilePicture" src="${user.picture}" alt="">`;
}

// Function triggered when the profile button is clicked
function profileButtonClick() {
    history.pushState(state, undefined); // Update browser history
    state = states.PROFILE; // Set internal state to PROFILE
    pageSwap(state); // Trigger page swap
}

// get inputs and send data
function editSaveButton() {
    const data = {
        firstName: document.querySelector('#modalFirstName').value,
        lastName: document.querySelector('#modalLastName').value,
        middleName: document.querySelector('#modalMiddleName').value,
        email: document.querySelector('#modalEmail').value,
        city: document.querySelector('#modalCity').value,
        country: document.querySelector('#modalCountry').value,
        biography: document.querySelector('#modalBio').value,
    };
    let fileArray = document.getElementById('formFileEditProfile').files;
    const formData = new FormData();
    formData.append('myFile', fileArray[0]);
    formData.append('myData', JSON.stringify(data));
    let response = postWithFile("editProfileData", formData);
    response.then((res) => {
        if(!res.error && res.needsUpdating){
            getDataToLoad();
            loadProfileData()
            document.getElementById('editForm').reset();
        } else {
            displayEditErrors(res);
        }
    });
}

// display feed-back from server, if needed
function displayEditErrors(res) {
    console.log(res)
    if(res.error) {
        if(!res.firstName.isUpdating && res.firstName.message !== ""){
            document.getElementById('editFirstNameTooltip').style.display = 'block';
            document.getElementById('editFirstNameTooltip').innerHTML = res.firstName.message;
        } else {
            document.getElementById('editFirstNameTooltip').style.display = 'none';
        }

        if(!res.lastName.isUpdating && res.lastName.message !== ""){
            document.getElementById('editLastNameTooltip').style.display = 'block';
            document.getElementById('editLastNameTooltip').innerHTML = res.lastName.message;
        } else {
            document.getElementById('editLastNameTooltip').style.display = 'none';
        }

        if(!res.middleName.isUpdating && res.middleName.message !== ""){
            document.getElementById('editMiddleNameTooltip').style.display = 'block';
            document.getElementById('editMiddleNameTooltip').innerHTML = res.middleName.message;
        } else {
            document.getElementById('editMiddleNameTooltip').style.display = 'none';
        }

        if(!res.email.isUpdating && res.email.message !== ""){
            document.getElementById('editEmailTooltip').style.display = 'block';
            document.getElementById('editEmailTooltip').innerHTML = res.email.message;
        } else {
            document.getElementById('editEmailTooltip').style.display = 'none';
        }

        if(!res.city.isUpdating && res.city.message !== ""){
            document.getElementById('editCityTooltip').style.display = 'block';
            document.getElementById('editCityTooltip').innerHTML = res.city.message;
        } else {
            document.getElementById('editCityTooltip').style.display = 'none';
        }

        if(!res.country.isUpdating && res.country.message !== ""){
            document.getElementById('editCountryTooltip').style.display = 'block';
            document.getElementById('editCountryTooltip').innerHTML = res.country.message;
        } else {
            document.getElementById('editCountryTooltip').style.display = 'none';
        }

        if(!res.bio.isUpdating && res.bio.message !== ""){
            document.getElementById('editBioTooltip').style.display = 'block';
            document.getElementById('editBioTooltip').innerHTML = res.bio.message;
        } else {
            document.getElementById('editBioTooltip').style.display = 'none';
        }

        if(res.notAnImage) {
            document.getElementById('editPictureTooltip').style.display = 'block';
            document.getElementById('editPictureTooltip').innerHTML = "The file is not an image!";
        } else {
            document.getElementById('editPictureTooltip').style.display = 'none';
        }
    } else {
        document.getElementById('editForm').reset();
    }
}

function getDataToLoad() {
    let response = getJSON("profile");
    response.then((res) => {
        loadDataFields(res);
    })
}

function loadProfileData() {
    let profileData = getJSON("profile");
    profileData.then((r) => {
        loadProfile(r);
    });
}

// function to load data for edit data in profile section
function loadDataFields(user) {
    document.getElementById('modalUsername').innerHTML = " " + user.username;
    document.getElementById('modalFirstName').placeholder = user.firstName;
    document.getElementById('modalLastName').placeholder = user.lastName;
    document.getElementById('modalMiddleName').placeholder = user.middleName;
    document.getElementById('modalEmail').placeholder = user.email;
    document.getElementById('profileModalDOB').innerHTML = " " + user.dob;
    document.getElementById('modalCity').placeholder = user.city;
    document.getElementById('modalCountry').placeholder = user.country;
    document.getElementById('modalBio').placeholder = user.biography;
}


/* OTHER PROFILE METHODS */


function loadOtherProfile(id) {
    let response = postJSON("otherProfile", {_id: id});
    response.then((r) => {
       loadOtherData(r);
       history.pushState(states.OTHERS, undefined); // Update browser history
        state = states.OTHERS; // Set internal state to REGISTER
        pageSwap(state); // Trigger page swap
    });
}

// function to load data of another user's profile
function loadOtherData(data) {
    console.log(data)
    document.getElementById('otherProfileName').innerHTML = data.name;
    document.getElementById('otherProfileUsername').innerHTML = data.username;
    document.getElementById('otherProfileLocation').innerHTML = data.city;
    document.getElementById('otherProfileBiography').innerHTML = data.biography;
    document.getElementById('otherProfileFollowers').innerHTML = "Followers: " + data.followersNo;
    document.getElementById('otherProfileFollowing').innerHTML = "Following: " + data.followingNo;
    document.getElementById('otherProfileImage').innerHTML = `<img class="mt-2 settingProfilePicture" src="${data.profilePicture}" alt="Avatar">`
    let myButton = document.getElementById('buttonOtherProfile');
    if(data.isLoggedInUser) {
        myButton.classList.replace("btn-outline-danger", "btn-outline-success");
        myButton.innerHTML = "Follow";
        myButton.disabled = true;
    } else {
        myButton.disabled = false;
        if(data.isFollowing){
            myButton.classList.replace("btn-outline-success", "btn-outline-danger");
            myButton.innerHTML = "Unfollow";
        } else {
            myButton.classList.replace("btn-outline-danger", "btn-outline-success");
            myButton.innerHTML = "Follow";
        }
    }

    clearDataOfAnElement(document.getElementById('otherProfilePosts'));
    for(const post of data.posts) {
        document.getElementById('otherProfilePosts').appendChild(newPost(post));
    }
}


/* SEARCH RELATED FUNCTIONS */


// to send search keywords to server
function searchUsers() {
    let searchData = {"search": document.querySelector('#searchBarInput').value};

    let response = postJSON("search-users", searchData);
    response.then((res) => {
        if(res.dataFound) {
            displaySearchResults(res.data);
            document.getElementById('searchForm').reset();
        }
    })
}

// to display the results of the search
function displaySearchResults(data) {
    // clear previous search
    clearDataOfAnElement(document.getElementById('searchResultsContainer'));

    for(let idx = 0; idx < data.length; idx++) {
        // Create the row element
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("row", "followingFriendDiv");

        // Create the first column for the image
        let imageDiv = document.createElement("div");
        imageDiv.classList.add("col-md-2");

        let image = document.createElement("img");
        image.classList.add("searchPictureDisplay", "mt-1");
        image.src = data[idx].profilePicture;
        image.alt = "";
        image.width = "60";

        imageDiv.appendChild(image);

        // Create the second column for the name and username
        let nameDiv = document.createElement("div");
        nameDiv.setAttribute("onclick", "loadOtherProfile(this.querySelector('input').value)")
        nameDiv.classList.add("col-md-5", "mt-2");

        let nameParagraph = document.createElement("p");
        nameParagraph.textContent = data[idx].name;

        let usernameParagraph = document.createElement("p");
        usernameParagraph.textContent = data[idx].username;
        usernameParagraph.style.marginTop = "-15px";

        let input = document.createElement("input");
        input.type = "hidden";
        input.value = data[idx]._id;

        nameDiv.appendChild(nameParagraph);
        nameDiv.appendChild(usernameParagraph);
        nameDiv.appendChild(input);

        // Create the third column for the follow button
        let buttonDiv = document.createElement("div");
        buttonDiv.classList.add("col-md", "mt-2");

        let followButtonDiv = document.createElement("div");
        followButtonDiv.classList.add("col-md", "hobbiesFollowButton", "mt-2");

        let followButton;

        if(data[idx].isLoggedInUser) {
            followButton = document.createElement("p");
            followButton.innerHTML = "Yourself";
            followButton.style.float = "center"
        } else {
            followButton = document.createElement("button");
            if(data[idx].isFollowing) {
                followButton.classList.add("btn", "btn-outline-danger", "myButton");
                followButton.textContent = "Unfollow";
            } else {
                followButton.classList.add("btn", "btn-outline-success", "myButton");
                followButton.textContent = "Follow";
            }
            followButton.setAttribute("type", "button");
        }

        followButtonDiv.appendChild(followButton);
        buttonDiv.appendChild(followButtonDiv);

        // Append all columns to the row
        rowDiv.appendChild(imageDiv);
        rowDiv.appendChild(nameDiv);
        rowDiv.appendChild(buttonDiv);

        // Append the row to the document body or any other parent element
        document.getElementById('searchResultsContainer').appendChild(rowDiv);
    }
}

function searchPosts() {
    let searchData = {"search": document.querySelector('#searchPostBarInput').value};

    let response = postJSON("search-posts", searchData);
    response.then((res) => {
        console.log(res);
        if(res.dataFound) {
            // remove data loaded previously
            clearDataOfAnElement(document.getElementById('postsField'));

            for (const post of res.posts) {
                document.getElementById('postsField').appendChild(newPost(post));
            }

            document.getElementById('searchPostForm').reset();
        }
    })
}

// identify which user it is following
document.getElementById('searchResultsContainer').addEventListener("click", function(event) {
    followPress(event)
});
// identify which user it is following
document.getElementById('otherProfileBox').addEventListener("click", function(event) {
    followPress(event)
});

function followPress(event) {
    if(event.target.tagName === "BUTTON") {
        let mainParent = event.target.parentNode.parentNode.parentNode;
        let username = mainParent.querySelector('p:nth-child(2)').textContent;
        followUnfollow({username: username}, mainParent);
    }
}

// function to send request to server, if it is already following, then the action is to unfollow and vice-versa
function followUnfollow(details, parent) {
    let response = postJSON("followUnfollow", details);
    response.then((res) => {
        if (res.isFollowing) { // following
            parent.querySelector('button').classList.replace('btn-outline-success', 'btn-outline-danger');
            parent.querySelector('button').textContent = "Unfollow";
            document.getElementById('otherProfileFollowers').innerHTML = "Followers: " + res.following.length;
        } else { // unfollowing
            parent.querySelector('button').classList.replace('btn-outline-danger', 'btn-outline-success');
            parent.querySelector('button').textContent = "Follow";
            document.getElementById('otherProfileFollowers').innerHTML = "Followers: " + res.following.length;
        }

        updateFollowing(res.following);
    });
}


/* POST RELATED FUNCTIONS */


// to create a new post format
function newPost(data) {
    let postDiv = document.createElement('div');
    postDiv.classList.add("container-fluid", "mt-2", "postBox");
    postDiv.innerHTML = `<!-- Top section row -->
        <div class="row postTop">
            <!-- First column in top section -->
            <div class="col-md-1 mt-1">
                <img class="postProfileImage" src="${data.profilePicture}" alt="">
            </div>
            <!-- Second column in top section -->
            <div class="col-md-7">
                <p class="mt-3">${data.postedByName}</p>
            </div>
            <!-- Third column in top section -->
            <div class="col-md">
                <p class="mt-3">Posted: <span class="postSpan">${data.formattedTime}</span></p>
            </div>
        </div>
        <!-- Content section -->
        <div class="mt-2" id="contentArea">
            <p>${data.text}</p>
            <div class="container-fluid imagecontainer" id="imageContainer"></div>
        </div>
        <!-- Bottom section row -->
        <div class="row postBottom mt-2">
            <!-- First column in bottom section -->
            <div class="col-md-2 mt-2 mb-2">
                <button class="btn btn-outline-danger" onclick="likeAPost(this.parentNode.parentNode.parentNode)">
                    <img src="assets/post/love.png" width="25" alt=""> ${data.likes.length}
                </button>
            </div>
            <!-- Second column in bottom section -->
            <div class="col-md mt-2 mb-2 postBottomCol2">
                <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#commentsModal" 
                onclick="commentSection(this.parentNode.parentNode.parentNode.querySelector('input').value, this)">
                    <img src="assets/post/comment.png" width="25" alt=""> View ${data.comments.length} comments
                </button>
            </div>
            <input type="hidden" value="${data._id}">
        </div> `;

    if(data.hasLiked){
        postDiv.querySelector('button').classList.replace("btn-outline-danger", "btn-danger");
    }

    if(data.image !== null) {
        postDiv.querySelector('#imageContainer').innerHTML = `<img class="postImage" src="${data.image}" alt="">`;
    }

    return postDiv;
}

// to like or unlike a post
function likeAPost(data) {
    let response = postJSON("like", {
        ID: data.querySelector('input').value,
        interactingWithPost: true,
        interactingWithComment: false,
    });

    response.then((res) => {
        updateElement(data, res);
    });
}// to populate comment section with comments


/* COMMENT RELATED FUNCTIONS */


// loads the comments section of a post
function commentSection(postID, element) {
    if(element !== undefined) {
        commentButton = element;
    }
    let commentsField = document.getElementById('commentsContainer');
    while(commentsField.firstChild){
        commentsField.removeChild(commentsField.firstChild);
    }
    document.getElementById('postIdentifierCommentModal').value = postID;
    document.getElementById('sendComment').setAttribute("onclick", "postComment(document.getElementById('postIdentifierCommentModal').value)");
    let response = postJSON("getComments", {postID: postID});
    response.then((res) => {
        for(const comment of res.comments) {
            document.getElementById('commentsContainer').appendChild(newComment(comment));
        }
    });
}

// to like or unlike a comment
function likeAComment(data) {
    let response = postJSON("like", {
        ID: data.querySelector('input').value,
            interactingWithPost: false,
            interactingWithComment: true,
    });

    response.then((res) => {
        updateElement(data, res);
    });
}

// to add a comment
function postComment(postID){
    let response = postJSON("new-comment", {
        postID: postID,
        postText: document.querySelector('#commentInputModal').value,
    });
    response.then((res) => {
        document.getElementById('commentInputModal').value = "";
        updateCommentNo(res.commentNo);
        document.getElementById('commentsContainer').appendChild(newComment(res.comment));
    });
}

// new comment format
function newComment(data) {
    let commentDiv = document.createElement('div');
    commentDiv.classList.add("row");
    commentDiv.innerHTML = `<!-- First column in row -->
    <div class="col-md-1">
        <img class="commentProfilePicture" src="${data.profilePicture}" alt="">
    </div>
    <!-- Second column in row -->
    <div class="col-md-6">
        <p id="username">${data.name}</p>
    </div>
    <!-- Third column in row -->
    <div class="col-md">
        <p id="dateTime">${data.time}</p>
    </div>
    <!-- Fourth column in row with class 'comment' -->
    <div class="comment">
        <p id="commentText">${data.text}</p>
        <button id="likeButton" class="btn btn-outline-secondary mb-2" type="button" onclick="likeAComment(this.parentNode.parentNode)">
            <img src="assets/post/like.png" alt=""> ${data.likes}
        </button>
    </div>
    <hr>
    <input type="hidden" id="idHolder" value="${data.id}">`;
    return commentDiv;
}

// to update an element after like/unlike, USED FOR POSTS AND COMMENTS
function updateElement(data, res) {
    let loveButton = data.querySelector('button');
    let btnLiked;
    let btnNotLiked;
    let text;

    if(res.interactingWithPost){
        btnLiked = "btn-danger";
        btnNotLiked = "btn-outline-danger";
        text = `<img src="assets/post/love.png" width="25" alt=""> ${res.likesNo}`;
    } else if (res.interactingWithComment){
        btnLiked = "btn-secondary";
        btnNotLiked = "btn-outline-secondary";
        text = `<img src='assets/post/like.png' alt=''> ${res.likesNo}`;
    }

    if(res.liked) {
        loveButton.classList.replace(btnNotLiked, btnLiked)
        loveButton.innerHTML = text;
    } else {
        loveButton.classList.replace(btnLiked, btnNotLiked)
        loveButton.innerHTML = text;
    }
}

function updateCommentNo(number) {
    commentButton.innerHTML = `<img src="assets/post/comment.png" width="25" alt=""> View ${number} comments`;
}


/* GENERAL USE METHODS */


async function postJSON(URL, jsonToPost) {
    // POST request for data relevant to home page
    try{
        let loadComments = await fetch(`/M00910464/${URL}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonToPost),
        });

        return await loadComments.json();
    } catch (err) {
        console.log(err);
    }
}

async function getJSON(URL) {
    // GET request for data relevant to home page
    try{
        let response = await fetch(`/M00910464/${URL}`);

        if(response.ok) {
            return await response.json();
        } else {
            console.log(await response.json());
        }
    } catch (err) {
        console.log(err);
    }
}

async function postWithFile(URL, formData) {
    try {
        // call URL with POST
        const post = await fetch(`/M00910464/${URL}`, {
            method: 'POST',
            body: formData
        });

        return await post.json();
    } catch (err) {
        console.log("Error creating the post... " + err);
    }
}

function clearDataOfAnElement(element){
    // remove data loaded previously
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
}