displayView = function(){
  // the code required to display a view
};

window.onload = function(){
  var main_div = document.getElementById('mainContent');
  var welcome_view = document.getElementById('welcomeview');

  // welcome_view is a <script> element, take all inner
  // HTML content and insert into main div.
  main_div.innerHTML = welcome_view.innerHTML;
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
  if (validateNonEmpty(document.forms["login"])) {
    console.log("Login form seem to be ok!");
  }
  return false;
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
    console.log("Signup form seems to be ok!");
  }

  return false;
};
