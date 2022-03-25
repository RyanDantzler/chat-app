var menuButton = document.querySelector('.menu-button');
var header = document.querySelector('header');

menuButton.addEventListener('click', function() {
  menuButton.classList.toggle('nav-open');
  header.classList.toggle('nav-open');
});