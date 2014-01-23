displayView = function(){
    // the code required to display a view
};

window.onload = function(){
    main_div = document.getElementById('mainContent');
    welcome_view = document.getElementById('welcomeview');

    // welcome_view is a <script> element, take all inner
    // HTML content and insert into main div.
    main_div.innerHTML = welcome_view.innerHTML;
};
