console.log("App.js is ready now!!");

$('.js-modal').modal();




// $('.lazy-load').Lazy();

$('.js-products-carousel').slick({
    prevArrow: '<?xml version="1.0" encoding="UTF-8"?><svg class="slick-prev slick-arrow c-prev" width="15px" height="5px" viewBox="0 0 19 9" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: sketchtool 50 (54983) - http://www.bohemiancoding.com/sketch --> <title>3832FA76-10B9-4082-B863-8C5C08B4B081</title> <desc>Created with sketchtool.</desc> <defs></defs> <g id="HOMEPAGE" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Homepage" transform="translate(-1214.000000, -6349.000000)" fill="#253237" fill-rule="nonzero"> <g id="Footer" transform="translate(0.000000, 6248.000000)"> <g id="Global/footer"> <g id="right-arrow-copy" transform="translate(1214.000000, 101.000000)"> <path d="M18.6895586,3.93789609 L14.4653094,0.233899517 C14.0805255,-0.103443695 13.4900742,-0.0719423785 13.1449124,0.302883413 C12.8001591,0.679503583 12.8326329,1.25669543 13.2168041,1.59443739 L15.5161126,3.60952477 L0.934796143,3.60952477 C0.41868737,3.60932539 0,4.01884251 0,4.52286357 C0,5.02708401 0.41868737,5.43640175 0.934796143,5.43640175 L15.6157806,5.43640175 L13.2394745,7.38748962 C13.0188977,7.5685225 12.9059543,7.82671367 12.9059543,8.0876961 C12.9059543,8.29464779 12.9782544,8.50319448 13.1248971,8.67405921 C13.4571919,9.06044878 14.0468263,9.11029263 14.4420263,8.7861082 L18.6664798,5.31777338 C18.8743938,5.14710802 18.9950983,4.89808812 19,4.63232068 C18.9857034,4.35479009 18.8911413,4.11494146 18.6895586,3.93789609 Z" id="Shape"></path> </g> </g> </g> </g> </g></svg>',
    nextArrow: '<?xml version="1.0" encoding="UTF-8"?><svg class="slick-next slick-arrow" width="15px" height="5px" viewBox="0 0 19 9" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: sketchtool 50 (54983) - http://www.bohemiancoding.com/sketch --> <title>3832FA76-10B9-4082-B863-8C5C08B4B081</title> <desc>Created with sketchtool.</desc> <defs></defs> <g id="HOMEPAGE" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Homepage" transform="translate(-1214.000000, -6349.000000)" fill="#253237" fill-rule="nonzero"> <g id="Footer" transform="translate(0.000000, 6248.000000)"> <g id="Global/footer"> <g id="right-arrow-copy" transform="translate(1214.000000, 101.000000)"> <path d="M18.6895586,3.93789609 L14.4653094,0.233899517 C14.0805255,-0.103443695 13.4900742,-0.0719423785 13.1449124,0.302883413 C12.8001591,0.679503583 12.8326329,1.25669543 13.2168041,1.59443739 L15.5161126,3.60952477 L0.934796143,3.60952477 C0.41868737,3.60932539 0,4.01884251 0,4.52286357 C0,5.02708401 0.41868737,5.43640175 0.934796143,5.43640175 L15.6157806,5.43640175 L13.2394745,7.38748962 C13.0188977,7.5685225 12.9059543,7.82671367 12.9059543,8.0876961 C12.9059543,8.29464779 12.9782544,8.50319448 13.1248971,8.67405921 C13.4571919,9.06044878 14.0468263,9.11029263 14.4420263,8.7861082 L18.6664798,5.31777338 C18.8743938,5.14710802 18.9950983,4.89808812 19,4.63232068 C18.9857034,4.35479009 18.8911413,4.11494146 18.6895586,3.93789609 Z" id="Shape"></path> </g> </g> </g> </g> </g></svg>',

    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [{
            breakpoint: 1200,
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
                slidesToShow: 1,
                slidesToScroll: 1
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
$('.js-testimonals-carousel').slick({
    prevArrow: '<a href="/" class="slick-prev--testimonial slick-arrow" style="display: block;"><?xml version="1.0" encoding="UTF-8"?><svg class="slick-prev--testimonial slick-arrow c-prev c-prev-testimonial" width="20px" height="9px" viewBox="0 0 19 9" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: sketchtool 50 (54983) - http://www.bohemiancoding.com/sketch --> <title>3832FA76-10B9-4082-B863-8C5C08B4B081</title> <desc>Created with sketchtool.</desc> <defs></defs> <g id="HOMEPAGE" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Homepage" transform="translate(-1214.000000, -6349.000000)" fill="#253237" fill-rule="nonzero"> <g id="Footer" transform="translate(0.000000, 6248.000000)"> <g id="Global/footer"> <g id="right-arrow-copy" transform="translate(1214.000000, 101.000000)"> <path d="M18.6895586,3.93789609 L14.4653094,0.233899517 C14.0805255,-0.103443695 13.4900742,-0.0719423785 13.1449124,0.302883413 C12.8001591,0.679503583 12.8326329,1.25669543 13.2168041,1.59443739 L15.5161126,3.60952477 L0.934796143,3.60952477 C0.41868737,3.60932539 0,4.01884251 0,4.52286357 C0,5.02708401 0.41868737,5.43640175 0.934796143,5.43640175 L15.6157806,5.43640175 L13.2394745,7.38748962 C13.0188977,7.5685225 12.9059543,7.82671367 12.9059543,8.0876961 C12.9059543,8.29464779 12.9782544,8.50319448 13.1248971,8.67405921 C13.4571919,9.06044878 14.0468263,9.11029263 14.4420263,8.7861082 L18.6664798,5.31777338 C18.8743938,5.14710802 18.9950983,4.89808812 19,4.63232068 C18.9857034,4.35479009 18.8911413,4.11494146 18.6895586,3.93789609 Z" id="Shape"></path> </g> </g> </g> </g> </g></svg><span class="c-text-arrow">PREVIOUS</span></a>',
    nextArrow: '<a href="/" class="slick-next--testimonial slick-arrow" style="display: block;"><?xml version="1.0" encoding="UTF-8"?><svg class="slick-next--testimonial slick-arrow c-next-testimonial" width="20px" height="9px" viewBox="0 0 19 9" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: sketchtool 50 (54983) - http://www.bohemiancoding.com/sketch --> <title>3832FA76-10B9-4082-B863-8C5C08B4B081</title> <desc>Created with sketchtool.</desc> <defs></defs> <g id="HOMEPAGE" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Homepage" transform="translate(-1214.000000, -6349.000000)" fill="#253237" fill-rule="nonzero"> <g id="Footer" transform="translate(0.000000, 6248.000000)"> <g id="Global/footer"> <g id="right-arrow-copy" transform="translate(1214.000000, 101.000000)"> <path d="M18.6895586,3.93789609 L14.4653094,0.233899517 C14.0805255,-0.103443695 13.4900742,-0.0719423785 13.1449124,0.302883413 C12.8001591,0.679503583 12.8326329,1.25669543 13.2168041,1.59443739 L15.5161126,3.60952477 L0.934796143,3.60952477 C0.41868737,3.60932539 0,4.01884251 0,4.52286357 C0,5.02708401 0.41868737,5.43640175 0.934796143,5.43640175 L15.6157806,5.43640175 L13.2394745,7.38748962 C13.0188977,7.5685225 12.9059543,7.82671367 12.9059543,8.0876961 C12.9059543,8.29464779 12.9782544,8.50319448 13.1248971,8.67405921 C13.4571919,9.06044878 14.0468263,9.11029263 14.4420263,8.7861082 L18.6664798,5.31777338 C18.8743938,5.14710802 18.9950983,4.89808812 19,4.63232068 C18.9857034,4.35479009 18.8911413,4.11494146 18.6895586,3.93789609 Z" id="Shape"></path> </g> </g> </g> </g> </g></svg><span class="c-text-arrow">NEXT</span></a>',

    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [{
            breakpoint: 1700,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: true
            }
        },
        {
            breakpoint: 850,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        },
        {
            breakpoint: 400,
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

//$('.lazy-load').Lazy();

$('.js-offcanvas').offcanvas({
    showOverlay: false
});

$(function() {
    $('.js-accordion').accordion({
        collapsible: true,
        autoHeight: false,
        navigation: true,
        heightStyle: "content"
    });

    $("#myOrder").click(function() {
        if ($("#orders").length == 0) {
            window.location.href = "/account";
            $('html, body').animate({
                scrollTop: ($("#orders").offset().top - 100)
            }, 2000);
        }
        $('html, body').animate({
            scrollTop: ($("#orders").offset().top - 100)
        }, 2000);
    });
});

// Pdp Slider

$('.c-product__sliderNav').slick({
    infinite:false,
    dots:false,
    speed:300,
    slidesToShow:4,
    slidesToScroll: 1
});