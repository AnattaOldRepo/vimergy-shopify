/* global $ */
$(function() {
    var iPad = navigator.userAgent.match(/iPad/i) !== null;
    var topNavItemClass = 'c-megamenu__navitem';
    var panelClass = 'c-megamenu__subnav';
    var panelGroupClass = 'c-megamenu__subnavGroup';
    var topNavItemElem = $('.' + topNavItemClass);        

    if(iPad) {
        // Add class to top level link
        topNavItemElem.find('> a').addClass('not-clicked');

        // Loop through each top level
        topNavItemElem.each(function(){
            var navItem = $(this);

            // On first click prevent default and show menu
            // On second click go to the link
            navItem.find('a:not(.no-menu a)').on('touchend', function(event) {
                var _this = $(this);

                if(_this.hasClass('not-clicked')) {
                    event.preventDefault();

                    // Hide all panels
                    topNavItemElem.find('.' + panelClass).removeClass('open');

                    // Show this panel
                    _this.parent().find('.' + panelClass).addClass('open');

                    // Add class back to all links
                    topNavItemElem.find('> a').addClass('not-clicked');

                    // Remove class from this link
                    _this.removeClass('not-clicked');
                } else { 
                    // Go to the link
                    window.location = _this.attr('href');
                }
            }).on('click', function(event) {
                event.preventDefault();
            });
        });   
    } else {
        // Init the accessible mega menu
        $('.js-megamenu').accessibleMegaMenu({            
            topNavItemClass: topNavItemClass,
            panelClass: panelClass,
            panelGroupClass: panelGroupClass
        });  
    }           
});