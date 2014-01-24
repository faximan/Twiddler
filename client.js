displayView = function(){
  // the code required to display a view
};

// Display the desired view HTML based on whether the user is logged
// in or not.
var setCurrentView = function(){
  var main_div = document.getElementById('mainContent');
  if (localStorage.token != "" && localStorage.token != undefined)
    main_div.innerHTML = document.getElementById('profileview').innerHTML;
  else
    main_div.innerHTML = document.getElementById('welcomeview').innerHTML;
};

window.onload = function(){
  setCurrentView();  // Decides whether to show welcome or profile view.
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
}

// Clears the status message of the login form.
var clearLoginStatusMsg = function() {
  document.getElementById("loginStatus").innerText = "";
}

// Clears the status message of the change password form.
var clearChangePwdStatusMsg = function() {
  document.getElementById("changePwdStatus").innerText = "";
}

// Add class "error" to all input fields that are empty in given form.
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
  return all_ok;
};

var validateLoginForm = function(){
  var form = document.forms["login"];
  if (validateNonEmpty(form)) {
    // Initiate login.
    var user = form["username"];
    var pwd = form["password"];
    var result = serverstub.signIn(user.value, pwd.value);

    if (result["success"] == false) {
      // Wrong login details.
      addError(user);
      addError(pwd);
      document.getElementById("loginStatus").innerText = result["message"];
    } else {
      var token = result["data"];
      localStorage.token = token;  // Store token in HTML5 local storage.
      setCurrentView();
    }
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

var validateSignupForm = function(){
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

    var result = serverstub.signUp({
      "email": email.value,
      "password": pwd1.value,
      "firstname": firstname.value,
      "familyname": familyname.value,
      "gender": gender.value,
      "city": city.value,
      "country": country.value});

    // Check if user already exists.
    if (result["success"] == false) {
      addError(email);
    } else {  // Signup succeeded. Clear all boxes.
      email.value = "";
      pwd1.value = "";
      pwd2.value = "";
      firstname.value = "";
      familyname.value = "";
      gender.value = "";
      city.value = "";
      country.value = "";
    }
    document.getElementById("signupStatus").innerText = result["message"];
  }
};

// Selects and displays the tab with the given name.
var selectTab = function(tabName, tabSelectorName) {
  // Change which tab to be visible.
  var tabs = document.getElementById('tabs');
  for (var i = 0; i < tabs.childNodes.length; i++) {
    var child = tabs.childNodes[i];
    if (child.className === "tab") {
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
    if (child.className === "tabSelector") {
      // Color the current tab selector.
      if (child.id == tabSelectorName) {
	      child.style.backgroundColor = "red";
      } else {
	      child.style.backgroundColor = "white";
      }
    }
  }
};

// Sign out on server.
var logout = function(){
  var result = serverstub.signOut(localStorage.token);
  if (result["success"] == false) {
    alert("Error logging out: " + result["message"]);
  } else {
    localStorage.token = "";  // Remove token from local storage.
    setCurrentView();
  }
};

var changePwd = function(){
  var form = document.forms["changepwd"];
  var all_ok = validateNonEmpty(form) &&
    validatePassword(form, "newpassword1", "newpassword2");

  if (all_ok) {
    // Initiate password change.
    var result = serverstub.changePassword(localStorage.token, form["oldpwd"].value, form["newpassword1"].value);

    // Show result of server call.
    document.getElementById("changePwdStatus").innerText = result["message"];
    if (result["success"] == false) {
      addError(form["oldpwd"]);
    }

    // Clear all fields.
    form["oldpwd"].value = "";
    form["newpassword1"].value = "";
    form["newpassword2"].value = "";
  }
};
