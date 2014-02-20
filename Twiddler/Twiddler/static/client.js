// The base url to the web server
var server = "http://127.0.0.1:5000"

// The code required to display a view.
displayView = function(){
  var main_div = document.getElementById('mainContent');

  // Check if the user is logged in.
  if (localStorage.token != "" && localStorage.token != undefined) {
    // Load logged in user data.
    main_div.innerHTML = document.getElementById('profileview').innerHTML;
    setupProfileView();
  } else {
    main_div.innerHTML = document.getElementById('welcomeview').innerHTML;
  }
};

window.onload = function(){
  displayView();  // Decides whether to show welcome or profile view.
};

// Add red error border to element.
var addError = function(element){
  // Remove current error to prevent adding it multiple times.
  removeError(element);

  element.className = element.className + " error";
};

// Remove red error border from element.
var removeError = function(element){
  element.className = element.className.replace(" error", "");
};

// Clears the status message of the signup form.
var clearSignupStatusMsg = function() {
  document.getElementById("signupStatus").innerText = "";
};

// Clears the status message of the login form.
var clearLoginStatusMsg = function() {
  document.getElementById("loginStatus").innerText = "";
};

// Clears the status message of the change password form.
var clearChangePwdStatusMsg = function() {
  document.getElementById("changePwdStatus").innerText = "";
};

// Clears the status message of the search user form.
var clearSearchUserStatusMsg = function() {
  document.getElementById("searchUserStatus").innerText = "";
};

// Add class "error" to all input fields that are empty in passed in form.
var validateNonEmpty = function(form){
  var all_ok = true;
  var inputFields = form.getElementsByTagName("input");
  for (var i = 0; i < inputFields.length; i++) {
    if ( (inputFields[i].type == "text" ||
          inputFields[i].type == "password") &&
         inputFields[i].value == "") {
      addError(inputFields[i]);
      all_ok = false;
    }
  }
  inputFields = form.getElementsByTagName("textarea");
  for (var i = 0; i < inputFields.length; i++) {
    if (inputFields[i].value == "") {
      addError(inputFields[i]);
      all_ok = false;
    }
  }
  return all_ok;
};

var validateLoginForm = function() {
  var form = document.forms["login"];
  if (validateNonEmpty(form)) {
    // Initiate login.
    var user = form["username"];
    var pwd = form["password"];

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
        var result = JSON.parse(req.responseText);
        if (result["SUCCESS"] == false) {
          // Wrong login details.
          addError(user);
          addError(pwd);
          document.getElementById("loginStatus").innerText = result["MESSAGE"];
        } else {
          var token = result["DATA"];
          localStorage.token = token;  // Store token in HTML5 local storage.
          displayView();
        }
      }
    };
    req.open("POST", server + "/sign_in", true);
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send("username=" + user.value + "&password=" + pwd.value);
  }
};

// Ensures that both password fields are the same.
var validatePassword = function(form, pwdId1, pwdId2){
  var pwd1 = form[pwdId1];
  var pwd2 = form[pwdId2];

  if (pwd1.value != pwd2.value) {
    addError(pwd1);
    addError(pwd2);
    pwd1.value = "";
    pwd2.value = "";
    return false;
  }
  return true;
};

var validateSignupForm = function() {
  var form = document.forms["signup"];
  var all_ok = validateNonEmpty(form) &&
    validatePassword(form, "password1", "password2");

  if (all_ok) {
    // Initiate signup.
    var email = form["email"];
    var firstname = form["firstname"];
    var familyname = form["familyname"];
    var gender = form["gender"];
    var city = form["city"];
    var country = form["country"];
    var password1 = form["password1"];
    var password2 = form["password2"];

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
        // Check if user already exists.
        var result = JSON.parse(req.responseText);
        if (result["SUCCESS"] == false) {
          addError(email);
        } else {  // Signup succeeded. Clear all boxes.
          email.value = "";
          password1.value = "";
          password2.value = "";
          firstname.value = "";
          familyname.value = "";
          gender.value = "";
          city.value = "";
          country.value = "";
        }
        document.getElementById("signupStatus").innerText = result["MESSAGE"];
      }
    };
    req.open("POST", server + "/sign_up", true);
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send("email=" + email.value + "&password=" + password1.value
            + "&firstname=" + firstname.value + "&familyname=" + familyname.value
            + "&gender=" + gender.value + "&city=" + city.value + "&country=" + country.value);
  }
};

// Selects and displays the tab with the given name.
var selectTab = function(tabName, tabSelector) {
  // Change which tab to be visible.
  var tabs = document.getElementById('tabs');
  for (var i = 0; i < tabs.childNodes.length; i++) {
    var child = tabs.childNodes[i];
    if (child.className == "tab") {
      // Show only current tab.
      if (child.id == tabName) {
	      child.style.display = "block";
      } else {
	      child.style.display = "none";
      }
    }
  }

  // Change color of tab selector accordingly.
  var tabSels = document.getElementById('tabSelectors');
  for (i = 0; i < tabSels.childNodes.length; i++) {
    child = tabSels.childNodes[i];

    // Check if the current child is a tab selector.
    if (child.className != undefined &&
        child.className.indexOf("tabSelector") != -1) {
      // Color the current tab selector.
      if (child == tabSelector) {
        // In case it is already present, remove the selected class first.
        child.className = child.className.replace(" selectedTab", "");
        child.className = child.className + " selectedTab";
      } else {
        child.className = child.className.replace(" selectedTab", "");
      }
    }
  }
  setupProfileView();
};

// The user the logged in user has searched for. This is used for state
// keeping to ensure that the newest messages are loaded every time the
// "Browse" view is opened and so that the HTML for showing user info
// and the wall of messages can be shared between the Home and the Browse
// tabs.
var browsedUserActive = "";

// Setup the profile view for the active tab. If the Browse tab is active
// and no email is given, display the wall for the cached email in browsedUserActive.
var setupProfileView = function(email){
  var mainDiv, result;
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      var result = JSON.parse(req.responseText);
      // Clear out old data.
      document.getElementById("homeTabBody").innerHTML = "";
      document.getElementById("browseTabBody").innerHTML = "";

      if (result["SUCCESS"] == false) {
        // Set status message eg "No such user.".
        document.getElementById("searchUserStatus").innerText = result["MESSAGE"];
        return;
      }

      // Display user data in the side view.
      mainDiv.innerHTML = document.getElementById("homebrowseview").innerHTML;
      var userData = result["DATA"];
      document.getElementById("userInfoFirst").innerText = userData["firstname"];
      document.getElementById("userInfoFamily").innerText = userData["familyname"];
      document.getElementById("userInfoGender").innerText = userData["gender"];
      document.getElementById("userInfoCity").innerText = userData["city"];
      document.getElementById("userInfoCountry").innerText = userData["country"];
      document.getElementById("userInfoEmail").innerText = userData["email"];

      reloadWall();
    }
  };

  // Check which tab is active.
  var url = "";
  if (document.getElementById("homeTab").style.display == "block") {
    mainDiv = document.getElementById("homeTabBody");
    url = server + "/get_user_data_by_token?token=" + localStorage.token;
  } else if(document.getElementById("browseTab").style.display == "block") {
    mainDiv = document.getElementById("browseTabBody");
    if (email != undefined) browsedUserActive = email;
    if (browsedUserActive != undefined && browsedUserActive != "")
      url = server + "/get_user_data_by_email?token=" + localStorage.token
      + "&email=" + browsedUserActive;
  }
  if (url != "") {
    req.open("GET", url, true);
    req.send();  // Fetch the right profile view from the server.
  }
};

var reloadWall = function(){
  var email = document.getElementById("userInfoEmail").innerText;
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      var result = JSON.parse(req.responseText);
      if (result["SUCESS"] == false) {
        alert(result["MESSAGE"]);
        return;
      }
      var posts = result["DATA"];
      var wall = document.getElementById("wall");
      // Clear old posts.
      wall.innerHTML = "";

      // Iterate through the list and create visual post elements for every entry.
      for (var i = 0; i < posts.length; i++) {
        var post = document.createElement("div");
        post.className = "wallPost";
        post.innerHTML = "<b>" + posts[i]["sender"] + "</b><br>" + posts[i]["body"];
        wall.appendChild(post);
      }
    }
  };
  req.open("GET", server + "/get_user_messages_by_email?token=" + localStorage.token
           + "&email=" + email, true);
  req.send();
};


// Posts a message to the currently displayed user.
var postMsg = function() {
  var form = document.forms["submitpost"];
  if (!validateNonEmpty(form)) {
    return;
  }

  var email = document.getElementById("userInfoEmail").innerText;
  var message = form["postinput"];

  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      var result = JSON.parse(req.responseText);
      if (result["SUCCESS"] == false) {
        alert(result["MESSAGE"]);
        return;
      }
      reloadWall(email);
      message.value = "";  // Empty post textarea after successful post.
    }
  };
  req.open("POST", server + "/post_message", true);
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  req.send("token=" + localStorage.token + "&message=" + message.value + "&email=" + email);
};

var searchUser = function(){
  var form = document.forms["searchuser"];
  if (!validateNonEmpty(form)) {
    return;
  }

  email = form["searchemail"].value;
  setupProfileView(email);
};

// Sign out on server.
var logout = function() {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      var result = JSON.parse(req.responseText);
      if (result["SUCCESS"] == false) {
        alert(result["message"]);
      } else {
        localStorage.token = "";  // Remove token from local storage.
        browsedUserActive = "";  // Browse tab should not be cached for the next user that logs in.
        displayView();  // Switch back to Welcome view.
      }
    }
  };
  req.open("GET", server + "/sign_out?token=" + localStorage.token, true);
  req.send();
};

var changePwd = function(){
  var form = document.forms["changepwd"];
  var all_ok = validateNonEmpty(form) &&
    validatePassword(form, "newpassword1", "newpassword2");

  if (all_ok) {
    // Send server request for password change.
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
        var result = JSON.parse(req.responseText);
        // Show result of server call.
        document.getElementById("changePwdStatus").innerText = result["MESSAGE"];
        if (result["SUCCESS"] == false) {
          addError(form["oldpwd"]);
        } else {
          // Clear all fields after successful password change.
          form["oldpwd"].value = "";
          form["newpassword1"].value = "";
          form["newpassword2"].value = "";
        }
      }
    };
    req.open("POST", server + "/change_password", true);
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send("token=" + localStorage.token
             + "&old_password=" + form["oldpwd"].value
             + "&new_password=" + form["newpassword1"].value);
  }
};
