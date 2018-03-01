(function() {

    var width = window.innerWidth;
    var isMobileLarge = (640 <= width && width <= 767);

    const prevArrow = ` 
        <svg class="c-sliderArrow c-sliderArrow--left" width="18px" height="34px" viewBox="0 0 18 34" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="375-celebs" transform="translate(-243.000000, -121.000000)" fill="#000000">
                    <g id="celebs">
                        <g id="arrows" transform="translate(243.000000, 121.000000)">
                            <polygon id="left" points="0 17 16.2580645 34 18 32.1785714 3.48387097 17 18 1.82142857 16.2580645 0"></polygon>
                        </g>
                    </g>
                </g>
            </g>
        </svg>`
    const nextArrow = `
            <svg class="c-sliderArrow c-sliderArrow--right" width="18px" height="34px" viewBox="0 0 18 34" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="375-celebs" transform="translate(-576.000000, -121.000000)" fill="#000000">
                    <g id="celebs">
                        <g id="arrows" transform="translate(243.000000, 121.000000)">
                            <polygon id="right" transform="translate(342.000000, 17.000000) rotate(-180.000000) translate(-342.000000, -17.000000) " points="333 17 349.258065 34 351 32.1785714 336.483871 17 351 1.82142857 349.258065 0"></polygon>
                        </g>
                    </g>
                </g>
            </g>
        </svg>`

    var hpCustomGridSliderSettings = {
        mobileFirst: true,
        centerMode: true,
        centerPadding: '46px',   
        slidesToShow: 1,
        infinite: false,
        responsive: [
            {
                breakpoint: 640,
                initialSlide: 1,
                settings: {
                    slidesToShow: 2,
                    initialSlide: 1
                }
            },
            {
                breakpoint: 768,
                settings: "unslick"
            }
        ],
        prevArrow: prevArrow,
        nextArrow: nextArrow,    
    }

    var hpProductsSliderSettings = {
        mobileFirst: true,
        centerMode: true,
        centerPadding: '46px',   
        slidesToShow: 1,
        infinite: false,
        responsive: [
            {
                breakpoint: 640,
                initialSlide: 1,
                settings: {
                    slidesToShow: 2,
                    initialSlide: 1
                }
            },
            {
                breakpoint: 768,
                settings: "unslick"
            }
        ],
        prevArrow: prevArrow,
        nextArrow: nextArrow,    
    }    

    var productImageSliderSettings = {
        mobileFirst: true,
        centerMode: true,
        centerPadding: '46px',   
        slidesToShow: 1,
        infinite: true,
        responsive: [
            {
                breakpoint: 640,
                initialSlide: 1,
                settings: {
                    slidesToShow: 2,
                    initialSlide: 1
                }
            },
            {
                breakpoint: 768,
                settings: "unslick"
            }
        ],
        prevArrow: prevArrow,
        nextArrow: nextArrow,    
    }  

    var productRelatedProductsSettings = {
        mobileFirst: true,
        centerMode: true,
        centerPadding: '46px',   
        slidesToShow: 1,
        infinite: true,
        responsive: [
            {
                breakpoint: 640,
                initialSlide: 1,
                settings: {
                    slidesToShow: 2,
                    initialSlide: 1
                }
            },
            {
                breakpoint: 768,
                settings: "unslick"
            }
        ],
        prevArrow: prevArrow,
        nextArrow: nextArrow,    
    }          

    var hpInstagramGridSliderSettings = {
        mobileFirst: true,
        centerMode: true,
        centerPadding: '46px',   
        slidesToShow: 1,
        infinite: false,
        responsive: [
            {
                breakpoint: 768,
                settings: "unslick"
            }
        ],
        prevArrow: prevArrow,
        nextArrow: nextArrow,    
    }      

    function waitForEl(selector, callback) {
        if (jQuery(selector).length) {
            callback();
        } else {
            setTimeout(function() {
                waitForEl(selector, callback);
            }, 100);
        }
    }  

    function twoCenterSlides(slider) {
        slider.on('init', function(event, slick) {
          slider.find('.slick-current').prev().addClass('slick-current-override');
        });

        slider.on('beforeChange', function(event, slick, currentSlide, nextSlide){
            var nextCurrentSlideEl = $(`[data-slick-index='${nextSlide}']`);
            $('.slick-current-override').removeClass('slick-current-override');
            $(nextCurrentSlideEl).prev().addClass('slick-current-override');
        }); 
    }     

    // disable non current slides that are links
    $('.slick-slide:not(.slick-active)').on('click', function(event) {
        event.preventDefault();
    })

    // home page sliders
    var homeCustomGridSlider = $('.js-hp-custom-grid-slider');
    var homeProductsSlider = $('.js-hp-products-slider');

    // product sliders
    var productImageSlider = $('.js-product-image-slider');
    var productRelatedProductsSlider = $('.js-product-related-products-slider'); 

    // set up logic for stlying 2 centered slides on mobile large sliders
    if (isMobileLarge) {
        twoCenterSlides(homeCustomGridSlider);
        twoCenterSlides(homeProductsSlider);
        twoCenterSlides(productImageSlider);
        twoCenterSlides(productRelatedProductsSlider);
    }    

    // init home sliders
    homeCustomGridSlider.slick(hpCustomGridSliderSettings);
    homeProductsSlider.slick(hpProductsSliderSettings);
    // wait until fourSixty loads instagram feed
    waitForEl('.fs-timeline-entry', function() {
        $('.c-hpIGridSection .fs-timeline').slick(hpInstagramGridSliderSettings)
    })

    // init product sliders
    productImageSlider.slick(productImageSliderSettings)
    productRelatedProductsSlider.slick(productRelatedProductsSettings)
})();
