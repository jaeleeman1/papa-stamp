document.documentElement.addEventListener('touchstart', function (event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, false);

window.addEventListener('load', function(){
  setTimeout(scrollTo, 0, 0, 1);
}, false);