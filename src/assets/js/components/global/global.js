(function(){
    if ((typeof Shopify) === 'undefined') { Shopify = {}; }
    if (!Shopify.formatMoney) {
      Shopify.formatMoney = function(cents, format) {
        var value = '',
            placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
            formatString = (format || this.money_format);

        if (typeof cents == 'string') {
          cents = cents.replace('.','');
        }

        function defaultOption(opt, def) {
          return (typeof opt == 'undefined' ? def : opt);
        }

        function formatWithDelimiters(number, precision, thousands, decimal) {
          precision = defaultOption(precision, 2);
          thousands = defaultOption(thousands, ',');
          decimal   = defaultOption(decimal, '.');

          if (isNaN(number) || number == null) {
            return 0;
          }

          number = (number/100.0).toFixed(precision);

          var parts   = number.split('.'),
              dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
              cents   = parts[1] ? (decimal + parts[1]) : '';

          return dollars + cents;
        }

        switch(formatString.match(placeholderRegex)[1]) {
          case 'amount':
            value = formatWithDelimiters(cents, 2);
            break;
          case 'amount_no_decimals':
            value = formatWithDelimiters(cents, 0);
            break;
          case 'amount_with_comma_separator':
            value = formatWithDelimiters(cents, 2, '.', ',');
            break;
          case 'amount_no_decimals_with_comma_separator':
            value = formatWithDelimiters(cents, 0, '.', ',');
            break;
        }

        return formatString.replace(placeholderRegex, value);
      };
    }
    
    $(document).ready(function() {
        var sortContainer = $('.js-sort-container');
        var sortTop = $('.js-sort-top');
        var sortDropdown = $('.js-sort-dropdown');

        sortTop.on('click', function() {
            sortContainer.toggleClass('is-open');
            sortDropdown.toggleClass('is-open');
        })

        $('.js-show-plus-sizes').on('click', function(e) {
            e.preventDefault();
            if ($('.c-product__optionItem--sizePlus')) {
                $('.c-product__optionItem--sizePlus').addClass('show-plus-sizes');
            }
        })
    });

    // size grid 
    $(document).ready(function() {

        $('.js-size-type-select').on('click', function() {
            var type;
            var newSection;
            var firstChart;
            if (!$(this).hasClass('is-active')) {
                $('.js-size-type-select.is-active').removeClass('is-active');
                $(this).addClass('is-active')
                type = $(this).attr('data-type-select')
                $('.js-size-type-section').removeClass('is-visible')

                newSection = $('.js-size-type-section[data-type-section="' + type +'"]')
                newSection.addClass('is-visible')
                // firstChart = newSection.find('.js-chart-section:not(.js-chart-section + .js-chart-section)')
                // firstChart.find('.js-chart-dropdown').addClass('is-open')
                // firstChart.find('.js-toggle-chart-dropdown').addClass('is-open')
            }
        })

        $('.js-toggle-chart-dropdown').on('click', function() {
            var toOpenDropdown;
            var typeSection = $(this).closest('.js-size-type-section');

            if ($(this).hasClass('is-open')) {
                // typeSection.find('.js-chart-dropdown.is-open').hide()
                typeSection.find('.js-chart-dropdown.is-open').removeClass('is-open')
                $(this).removeClass('is-open')
            }

            else {
                typeSection.find('.js-toggle-chart-dropdown').removeClass('is-open')
                // typeSection.find('.js-chart-dropdown.is-open').hide()
                typeSection.find('.js-chart-dropdown.is-open').removeClass('is-open')

                $(this).addClass('is-open')  
                var toOpenDropdown = $(this).closest('.js-chart-section').find('.js-chart-dropdown'); 
                // toOpenDropdown.show();
                toOpenDropdown.addClass('is-open')    
            }
        })

        $('.js-search-open').on('click', function(e) {
            e.preventDefault();
            var $this = $(this);

            if (!$this.hasClass('search-is-open')) {
                $this.closest('.c-headerNav--secondary').addClass('search-is-open');
                $this.addClass('search-is-open')
            }

            else {
                $this.closest('.c-headerNav--secondary').removeClass('search-is-open');
                $this.removeClass('search-is-open')                
            }
        })
    });

    $(document).ready(function() {
        var $window = $(window);
           
        $window.resize(function(){
            if( $window.width() >= 1024) {
                if ($('.c-offcanvas--left').hasClass('offcanvas-open')) {
                    $('.c-offcanvas--left .c-offcanvas__close').trigger('click')
                }
            }
        })
    });

    $(document).ready(function() {
        function showRecoverPasswordForm() {
            $('#RecoverPasswordForm').show();
            $('#CustomerLoginForm').hide();
        }

        function hideRecoverPasswordForm() {
            $('#RecoverPasswordForm').hide();
            $('#CustomerLoginForm').show();
        }
        
        $('#RecoverPassword').on('click', function(evt) {
            evt.preventDefault();
            showRecoverPasswordForm();
        });

        $('#HideRecoverPasswordLink').on('click', function(evt) {
            evt.preventDefault();
            hideRecoverPasswordForm();
        });

        // Allow deep linking to recover password form
        if (window.location.hash == '#recover') {
            showRecoverPasswordForm();
        }
    });

})();