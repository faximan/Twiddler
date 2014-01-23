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

var logout = function(){
  localStorage.token = "";
  setCurrentView();
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

// Add class "error" to all input fields that are empty in given form.
var validateNonEmpty = function(form){
  var all_ok = true;
  var inputFields = form.getElementsByTagName("input");
  for (var i = 0; i < inputFields.length; i++) {
    if (inputFields[i].type == "text" && inputFields[i].value == "") {
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
  return false;  // No reload.
};

var validateSignupForm = function(){
  var form = document.forms["signup"];

  var all_ok = validateNonEmpty(form);

  // Make sure the two passwords are the same.
  var pwd1 = form["password1"];
  var pwd2 = form["password2"];

  if (pwd1.value != pwd2.value) {
    addError(pwd1);
    addError(pwd2);
    pwd1.value = "";
    pwd2.value = "";

    all_ok = false;
  }

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

  return false;  // No reload.
};
