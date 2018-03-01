(function() {
    var width = window.innerWidth;
    var controller = new ScrollMagic.Controller();
    var duration;
    var durationValueCache;
    var mobileScreenWidth = (width <= 767) ? true : false;

    function getDuration (offsetEl = false) {
        if (offsetEl) {
            // return offset to cached height
            return durationValueCache + $(offsetEl).height();
        } else {
            // return cached height
            return durationValueCache;
        }
    }

    function updateDuration (e) {
      durationValueCache = window.innerHeight;
    }

    // update duration on resize
    $(window).on("resize", updateDuration);

    // set initial value
    $(window).triggerHandler("resize");

    if (!mobileScreenWidth) {
        // Home Hero Text -- Desktop
        if ($('.js-animElement__HomeHeroText--desktop').length){
            new ScrollMagic.Scene({
                    triggerHook: 0,
                    offset: 0,
                    duration: $('.js-animElement__HomeHeroText--desktop').offset().top + $('.js-animElement__HomeHeroText--desktop').height()
                })
                .setTween('.js-animElement__HomeHeroText--desktop', {xPercent:15})
                // .addIndicators()
                .addTo(controller);
        }
    }

    if (width >= 1024) {
        // Home Alcoholidays Text -- Desktop
        if ($('.js-animElement__alcoholidaysText--desktop').length){
                new ScrollMagic.Scene({
                    triggerHook: 1,
                    triggerElement: '.js-animTrigger__alcoholidaysText--desktop',
                    duration: getDuration($('.js-animTrigger__alcoholidaysText--desktop'))
                })
                .setTween('.js-animElement__alcoholidaysText--desktop', {x:0})
                // .addIndicators()
                .addTo(controller);  
        }
    }

    if (!mobileScreenWidth) {
        // Home Collection Hero
        if ($('.js-animElement__colHeroText').length){
            new ScrollMagic.Scene({
                    triggerHook: 0,
                    offset: 0,
                    duration: $('.js-animElement__colHeroText').offset().top + $('.js-animElement__colHeroText').height()
                })
                .setTween('.js-animElement__colHeroText', {xPercent:25})
                // .addIndicators()
                .addTo(controller);
        }
    }   

    if (width >= 768) {
        // product animation
        // console.log('duration', $('.js-animTrigger__productImageSection').height() - $('.js-animElement__productInfoSection').outerHeight())
        console.log($('.js-animTrigger__productImageSection').height())
        console.log($('.js-animElement__productInfoSection').outerHeight())

        if ($('.js-animTrigger__productImageSection').length){
            if ($('.js-animTrigger__productImageSection').height() - $('.js-animElement__productInfoSection').outerHeight() > 0) {
                new ScrollMagic.Scene({
                        triggerHook: 0,
                        offset: 0,
                        triggerElement: '.c-product__inner',
                        duration:  $('.js-animTrigger__productImageSection').height() - $('.js-animElement__productInfoSection').outerHeight()
                    })
                    .setPin('.js-animElement__productInfoSection', {pushFollowers: false}) // default true
                    // .addIndicators()
                    .addTo(controller);
            }
        }
    }       
    

})();