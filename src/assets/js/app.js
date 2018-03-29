console.log("App.js is ready now!!");

// $('.js-modal').modal();




// $('.lazy-load').Lazy();
      
$('.js-testimonals-carousel').slick({
    prevArrow:'<button type="button" class="slick-prev slick-arrow" style="display: block;"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 71.831 71.831" enable-background="new 0 0 71.831 71.831" xml:space="preserve"><g><rect x="16.33" y="45.952" transform="matrix(0.7071 0.7071 -0.7071 0.7071 44.937 -10.5836)" width="37.828" height="6"></rect><rect x="16.331" y="23.202" transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 78.6933 19.8089)" width="37.826" height="6"></rect></g></svg></button>',
    nextArrow:'<button type="button" class="slick-next slick-arrow" style="display: block;"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 71.831 71.831" enable-background="new 0 0 71.831 71.831" xml:space="preserve"><g><rect x="16.33" y="45.121" transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 94.1925 57.2278)" width="37.828" height="6"></rect><rect x="16.331" y="22.371" transform="matrix(0.7071 0.7071 -0.7071 0.7071 28.2625 -17.4903)" width="37.826" height="6"></rect></g></svg></button>',

    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: false
        }
      },
      {
        breakpoint: 850,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 584,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
 
$('.c-mobileNav--expand').click(function(e) {
    e.preventDefault();
    $(this).toggleClass('active');
});

$('.lazy-load').Lazy();

$('.js-offcanvas').offcanvas({
  callbacks: {
      beforeOpen: function() {

      },

      open: function() {

      },

      beforeClose: function()   {

      },

      close: function() {

      } 
  }
});
$(function() {
  $('.js-accordion').accordion({
    collapsible: true,
   autoHeight: false,
   heightStyle: "content" 
   });
  });
