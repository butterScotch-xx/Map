// The sidebar.js class manages the use of the sidebar on the map
// TODO: The intent of the side bar is to provide a space to display large quantities of information which 
// will not fit in a simple inforwindow. This will be especially necissary for locations with multiple elements.
// Have not made any of the data loader / display code
// This requires jquery
define([], function () {

  var showDuration = 300; // ms
  var sidebar;
  var loaderAni;
  
  
  // create sidebar

  function init (mapElem) {
      if(!jQuery) return;
      
      sidebar = document.createElement('div');
      loaderAni = document.createElement('img');
      loaderAni.className = 'whiteLoader';
      loaderAni.src = "../../resources/images/load_animation_white.gif";
      sidebar.appendChild(loaderAni);
      sidebar.className = 'sidebar';
      mapElem.parentElement.appendChild(sidebar);
      $('.whiteLoader').fadeOut(1,function () {});
  }
  
  // ---------------------------------------------------- //
  // --------------- Animation Functions -----------------// 
  
    function showLoader() {
      $('.whiteLoader').fadeIn(1000, function () {}); 
    }
    function hideLoader() {
      $('.whiteLoader').fadeOut(100, function () {}); 
    }
    function showBar () {
      $(".sidebar").stop().animate({top:'-220px'},{queue:false,duration:showDuration});
      showLoader();
      window.addEventListener("keyup",hideBarListener);
      
    }
    function hideBarListener(event) {
        if(event.keyIdentifier === 'U+001B'){
          hideBar();
          hideLoader();
          window.removeEventListener("keyup",hideBarListener);
        }
      }
    function hideBar () {
      $(".sidebar").stop().animate({top:'0px'},{queue:false, duration:showDuration});
    }
          
    // PUBLIC METHODS
    // init initializes the sidebar
    // showBar puts up the sidebar on the map
    return {
      init : init,
      showBar : showBar
    }
}); // end of module