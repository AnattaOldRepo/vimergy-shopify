'use strict';

/*============================================================================
  Ajax the add to cart experience by revealing it in a side drawer
  Plugin Documentation - http://shopify.github.io/Timber/#ajax-cart
  (c) Copyright 2015 Shopify Inc. Author: Carson Shold (@cshold). All Rights Reserved.

  This file includes:
    - Basic Shopify Ajax API calls
    - Ajax cart plugin

  This requires:
    - jQuery 1.8+
    - handlebars.min.js (for cart template)
    - modernizr.min.js
    - snippet/ajax-cart-template.liquid

  Customized version of Shopify's jQuery API
  (c) Copyright 2009-2015 Shopify Inc. Author: Caroline Schnapp. All Rights Reserved.
==============================================================================*/
(function () {
  if (typeof ShopifyAPI === 'undefined') {
    window.ShopifyAPI = {};
  }

  /*============================================================================
    API Helper Functions
  ==============================================================================*/
  function attributeToString(attribute) {
    if (typeof attribute !== 'string') {
      attribute += '';
      if (attribute === 'undefined') {
        attribute = '';
      }
    }
    return jQuery.trim(attribute);
  };

  /*============================================================================
    API Functions
  ==============================================================================*/
  ShopifyAPI.onCartUpdate = function (cart) {
    // alert('There are now ' + cart.item_count + ' items in the cart.');
  };

  ShopifyAPI.updateCartNote = function (note, callback) {
    var $body = $(document.body),
        params = {
      type: 'POST',
      url: '/cart/update.js',
      data: 'note=' + attributeToString(note),
      dataType: 'json',
      beforeSend: function beforeSend() {
        $body.trigger('beforeUpdateCartNote.ajaxCart', note);
      },
      success: function success(cart) {
        if (typeof callback === 'function') {
          callback(cart);
        } else {
          ShopifyAPI.onCartUpdate(cart);
        }
        $body.trigger('afterUpdateCartNote.ajaxCart', [note, cart]);
      },
      error: function error(XMLHttpRequest, textStatus) {
        $body.trigger('errorUpdateCartNote.ajaxCart', [XMLHttpRequest, textStatus]);
        ShopifyAPI.onError(XMLHttpRequest, textStatus);
      },
      complete: function complete(jqxhr, text) {
        $body.trigger('completeUpdateCartNote.ajaxCart', [this, jqxhr, text]);
      }
    };
    jQuery.ajax(params);
  };

  ShopifyAPI.onError = function (XMLHttpRequest, textStatus) {
    var data = eval('(' + XMLHttpRequest.responseText + ')');
    if (!!data.message) {
      alert(data.message + '(' + data.status + '): ' + data.description);
    }
  };

  /*============================================================================
    POST to cart/add.js returns the JSON of the cart
      - Allow use of form element instead of just id
      - Allow custom error callback
  ==============================================================================*/
  ShopifyAPI.addItemFromForm = function (form, callback, errorCallback) {
    var $body = $(document.body),
        params = {
      type: 'POST',
      url: '/cart/add.js',
      data: jQuery(form).serialize(),
      dataType: 'json',
      beforeSend: function beforeSend(jqxhr, settings) {
        $body.trigger('beforeAddItem.ajaxCart', form);
      },
      success: function success(line_item) {
        if (typeof callback === 'function') {
          callback(line_item, form);
        } else {
          ShopifyAPI.onItemAdded(line_item, form);
        }
        $body.trigger('afterAddItem.ajaxCart', [line_item, form]);
      },
      error: function error(XMLHttpRequest, textStatus) {
        if (typeof errorCallback === 'function') {
          errorCallback(XMLHttpRequest, textStatus);
        } else {
          ShopifyAPI.onError(XMLHttpRequest, textStatus);
        }
        $body.trigger('errorAddItem.ajaxCart', [XMLHttpRequest, textStatus]);
      },
      complete: function complete(jqxhr, text) {
        $body.trigger('completeAddItem.ajaxCart', [this, jqxhr, text]);
      }
    };
    jQuery.ajax(params);
  };

  // Get from cart.js returns the cart in JSON
  ShopifyAPI.getCart = function (callback) {
    $(document.body).trigger('beforeGetCart.ajaxCart');
    jQuery.getJSON('/cart.js', function (cart, textStatus) {
      if (typeof callback === 'function') {
        callback(cart);
      } else {
        ShopifyAPI.onCartUpdate(cart);
      }
      $(document.body).trigger('afterGetCart.ajaxCart', cart);
    });
  };

  // POST to cart/change.js returns the cart in JSON
  ShopifyAPI.changeItem = function (line, quantity, callback) {
    var $body = $(document.body),
        params = {
      type: 'POST',
      url: '/cart/change.js',
      data: 'quantity=' + quantity + '&line=' + line,
      dataType: 'json',
      beforeSend: function beforeSend() {
        $body.trigger('beforeChangeItem.ajaxCart', [line, quantity]);
      },
      success: function success(cart) {
        if (typeof callback === 'function') {
          callback(cart);
        } else {
          ShopifyAPI.onCartUpdate(cart);
        }
        $body.trigger('afterChangeItem.ajaxCart', [line, quantity, cart]);
      },
      error: function error(XMLHttpRequest, textStatus) {
        $body.trigger('errorChangeItem.ajaxCart', [XMLHttpRequest, textStatus]);
        ShopifyAPI.onError(XMLHttpRequest, textStatus);
      },
      complete: function complete(jqxhr, text) {
        $body.trigger('completeChangeItem.ajaxCart', [this, jqxhr, text]);
      }
    };
    jQuery.ajax(params);
  };

  /*============================================================================
    Ajax Shopify Add To Cart
  ==============================================================================*/
  var ajaxCart = function (module, $) {

    'use strict';

    // Public functions

    var init, loadCart;

    // Private general variables
    var settings, isUpdating, $body;

    // Private plugin variables
    var $formContainer, $addToCart, $cartCountSelector, $cartCostSelector, $cartContainer, $drawerContainer;

    // Private functions
    var updateCountPrice, formOverride, itemAddedCallback, itemErrorCallback, cartUpdateCallback, buildCart, cartCallback, adjustCart, adjustCartCallback, createQtySelectors, qtySelectors, validateQty;

    /*============================================================================
      Initialise the plugin and define global options
    ==============================================================================*/
    init = function init(options) {

      // Default settings
      settings = {
        formSelector: 'form[action^="/cart/add"]',
        cartContainer: '#CartContainer',
        addToCartSelector: 'input[type="submit"]',
        cartCountSelector: null,
        cartCostSelector: null,
        moneyFormat: '$',
        disableAjaxCart: false,
        enableQtySelectors: true
      };

      // Override defaults with arguments
      $.extend(settings, options);

      // Select DOM elements
      $formContainer = $(settings.formSelector);
      $cartContainer = $(settings.cartContainer);
      $addToCart = $formContainer.find(settings.addToCartSelector);
      $cartCountSelector = $(settings.cartCountSelector);
      $cartCostSelector = $(settings.cartCostSelector);

      // General Selectors
      $body = $(document.body);

      // Track cart activity status
      isUpdating = false;

      // Setup ajax quantity selectors on the any template if enableQtySelectors is true
      if (settings.enableQtySelectors) {
        qtySelectors();
      }

      // Take over the add to cart form submit action if ajax enabled
      if (!settings.disableAjaxCart && $addToCart.length) {
        formOverride();
      }

      // Run this function in case we're using the quantity selector outside of the cart
      adjustCart();
    };

    loadCart = function loadCart() {
      $('body').addClass('drawer--is-loading');
      ShopifyAPI.getCart(cartUpdateCallback);
    };

    updateCountPrice = function updateCountPrice(cart) {
      if ($cartCountSelector) {
        $cartCountSelector.html(cart.item_count).removeClass('hidden-count');

        if (cart.item_count === 0) {
          $cartCountSelector.addClass('hidden-count');
        }
      }
      if ($cartCostSelector) {
        $cartCostSelector.html(Shopify.formatMoney(cart.total_price, settings.moneyFormat));
      }
    };

    formOverride = function formOverride() {
      $formContainer.on('submit', function (evt) {
        evt.preventDefault();

        // Add class to be styled if desired
        $addToCart.removeClass('is-added').addClass('is-adding');

        // Remove any previous quantity errors
        $('.qty-error').remove();

        ShopifyAPI.addItemFromForm(evt.target, itemAddedCallback, itemErrorCallback);
      });
    };

    itemAddedCallback = function itemAddedCallback(product) {
      $addToCart.removeClass('is-adding').addClass('is-added');

      ShopifyAPI.getCart(cartUpdateCallback);
    };

    itemErrorCallback = function itemErrorCallback(XMLHttpRequest, textStatus) {
      var data = eval('(' + XMLHttpRequest.responseText + ')');
      $addToCart.removeClass('is-adding is-added');

      if (!!data.message) {
        if (data.status == 422) {
          $formContainer.after('<div class="errors qty-error">' + data.description + '</div>');
        }
      }
    };

    cartUpdateCallback = function cartUpdateCallback(cart) {
      // Update quantity and price
      updateCountPrice(cart);
      buildCart(cart);
    };

    buildCart = function buildCart(cart) {
      // Start with a fresh cart div
      $cartContainer.empty();

      // Show empty cart
      if (cart.item_count === 0) {
        $cartContainer.append('<p class="c-cart__emptyText">Your cart is currently empty.</p>');
        cartCallback(cart);
        return;
      }

      // Handlebars.js cart layout
      var items = [],
          item = {},
          data = {},
          source = $("#CartTemplate").html(),
          template = Handlebars.compile(source);

      // Add each item to our handlebars.js data
      $.each(cart.items, function (index, cartItem) {

        /* Hack to get product image thumbnail
         *   - If image is not null
         *     - Remove file extension, add _small, and re-add extension
         *     - Create server relative link
         *   - A hard-coded url of no-image
        */
        if (cartItem.image != null) {
          var prodImg = cartItem.image.replace(/(\.[^.]*)$/, "_large$1").replace('http:', '');
        } else {
          var prodImg = "//cdn.shopify.com/s/assets/admin/no-image-medium-cc9732cb976dd349a0df1d39816fbcc7.gif";
        }

        console.log(cartItem);

        // Create item's data object and add to 'items' array
        item = {
          id: cartItem.variant_id,
          key: cartItem.key,
          line: index + 1, // Shopify uses a 1+ index in the API
          url: cartItem.url,
          img: prodImg,
          name: cartItem.product_title,
          variation: cartItem.variant_title,
          variantSize: cartItem.variant_options[0],
          variantColor: cartItem.variant_options[1],
          properties: cartItem.properties,
          itemAdd: cartItem.quantity + 1,
          itemMinus: cartItem.quantity - 1,
          itemQty: cartItem.quantity,
          price: Shopify.formatMoney(cartItem.price, settings.moneyFormat),
          vendor: cartItem.vendor,
          linePrice: Shopify.formatMoney(cartItem.line_price, settings.moneyFormat),
          originalLinePrice: Shopify.formatMoney(cartItem.original_line_price, settings.moneyFormat),
          discounts: cartItem.discounts,
          discountsApplied: cartItem.line_price === cartItem.original_line_price ? false : true
        };

        items.push(item);
      });

      // Gather all cart data and add to DOM
      data = {
        items: items,
        note: cart.note,
        totalPrice: Shopify.formatMoney(cart.total_price, settings.moneyFormat),
        totalCartDiscount: cart.total_discount === 0 ? 0 : '[savings]'.replace('[savings]', Shopify.formatMoney(cart.total_discount, settings.moneyFormat)),
        totalCartDiscountApplied: cart.total_discount === 0 ? false : true
      };

      $cartContainer.append(template(data));

      cartCallback(cart);
    };

    cartCallback = function cartCallback(cart) {
      $body.removeClass('drawer--is-loading');
      $body.trigger('afterCartLoad.ajaxCart', cart);

      if (window.Shopify && Shopify.StorefrontExpressButtons) {
        Shopify.StorefrontExpressButtons.initialize();
      }
    };

    adjustCart = function adjustCart() {
      // Delegate all events because elements reload with the cart

      $body.on('click', '.ajaxcart__qty--remove', function () {
        if (isUpdating) {
          return;
        }

        var $el = $(this),
            line = $el.data('line'),
            $qtySelector = $el.closest('.c-cart__row').find('.ajaxcart__qty-num'),
            qty = 0; // remove

        // If it has a data-line, update the cart.
        // Otherwise, just update the input's number
        if (line) {
          updateQuantity(line, qty);
        } else {
          $qtySelector.val(qty);
        }
      });

      // Add or remove from the quantity
      $body.on('click', '.ajaxcart__qty-adjust', function () {
        if (isUpdating) {
          return;
        }

        var $el = $(this),
            line = $el.data('line'),
            $qtySelector = $el.siblings('.ajaxcart__qty-num'),
            qty = parseInt($qtySelector.val().replace(/\D/g, ''));

        var qty = validateQty(qty);

        // Add or subtract from the current quantity
        if ($el.hasClass('ajaxcart__qty--plus')) {
          qty += 1;
        } else {
          qty -= 1;
          if (qty <= 0) qty = 0;
        }

        // If it has a data-line, update the cart.
        // Otherwise, just update the input's number
        if (line) {
          updateQuantity(line, qty);
        } else {
          $qtySelector.val(qty);
        }
      });

      // Update quantity based on input on change
      $body.on('change', '.ajaxcart__qty-num', function () {
        if (isUpdating) {
          return;
        }

        var $el = $(this),
            line = $el.data('line'),
            qty = parseInt($el.val().replace(/\D/g, ''));

        var qty = validateQty(qty);

        // If it has a data-line, update the cart
        if (line) {
          updateQuantity(line, qty);
        }
      });

      // Prevent cart from being submitted while quantities are changing
      $body.on('submit', 'form.ajaxcart', function (evt) {
        if (isUpdating) {
          evt.preventDefault();
        }
      });

      // Highlight the text when focused
      $body.on('focus', '.ajaxcart__qty-adjust', function () {
        var $el = $(this);
        setTimeout(function () {
          $el.select();
        }, 50);
      });

      function updateQuantity(line, qty) {
        isUpdating = true;

        // Add activity classes when changing cart quantities
        var $row = $('.ajaxcart__row[data-line="' + line + '"]').addClass('is-loading');

        if (qty === 0) {
          $row.parent().addClass('is-removed');
        }

        // Slight delay to make sure removed animation is done
        setTimeout(function () {
          ShopifyAPI.changeItem(line, qty, adjustCartCallback);
        }, 250);
      }

      // Save note anytime it's changed
      $body.on('change', 'textarea[name="note"]', function () {
        var newNote = $(this).val();

        // Update the cart note in case they don't click update/checkout
        ShopifyAPI.updateCartNote(newNote, function (cart) {});
      });
    };

    adjustCartCallback = function adjustCartCallback(cart) {
      // Update quantity and price
      updateCountPrice(cart);

      // Reprint cart on short timeout so you don't see the content being removed
      setTimeout(function () {
        isUpdating = false;
        ShopifyAPI.getCart(buildCart);
      }, 150);
    };

    createQtySelectors = function createQtySelectors() {
      // If there is a normal quantity number field in the ajax cart, replace it with our version
      if ($('input[type="number"]', $cartContainer).length) {
        $('input[type="number"]', $cartContainer).each(function () {
          var $el = $(this),
              currentQty = $el.val();

          var itemAdd = currentQty + 1,
              itemMinus = currentQty - 1,
              itemQty = currentQty;

          var source = $("#AjaxQty").html(),
              template = Handlebars.compile(source),
              data = {
            key: $el.data('id'),
            itemQty: itemQty,
            itemAdd: itemAdd,
            itemMinus: itemMinus
          };

          // Append new quantity selector then remove original
          $el.after(template(data)).remove();
        });
      }
    };

    qtySelectors = function qtySelectors() {
      // Change number inputs to JS ones, similar to ajax cart but without API integration.
      // Make sure to add the existing name and id to the new input element
      var numInputs = $('input[type="number"]');

      if (numInputs.length) {
        numInputs.each(function () {
          var $el = $(this),
              currentQty = $el.val(),
              inputName = $el.attr('name'),
              inputId = $el.attr('id');

          var itemAdd = currentQty + 1,
              itemMinus = currentQty - 1,
              itemQty = currentQty;

          var source = $("#JsQty").html(),
              template = Handlebars.compile(source),
              data = {
            key: $el.data('id'),
            itemQty: itemQty,
            itemAdd: itemAdd,
            itemMinus: itemMinus,
            inputName: inputName,
            inputId: inputId
          };

          // Append new quantity selector then remove original
          $el.after(template(data)).remove();
        });

        // Setup listeners to add/subtract from the input
        $('.js-qty__adjust').on('click', function () {
          var $el = $(this),
              id = $el.data('id'),
              $qtySelector = $el.siblings('.js-qty__num'),
              qty = parseInt($qtySelector.val().replace(/\D/g, ''));

          var qty = validateQty(qty);

          // Add or subtract from the current quantity
          if ($el.hasClass('js-qty__adjust--plus')) {
            qty += 1;
          } else {
            qty -= 1;
            if (qty <= 1) qty = 1;
          }

          // Update the input's number
          $qtySelector.val(qty);
        });
      }
    };

    validateQty = function validateQty(qty) {
      if (parseFloat(qty) == parseInt(qty) && !isNaN(qty)) {
        // We have a valid number!
      } else {
        // Not a number. Default to 1.
        qty = 1;
      }
      return qty;
    };

    module = {
      init: init,
      load: loadCart
    };

    return module;
  }(ajaxCart || {}, jQuery);

  window.ajaxCart = ajaxCart;
})();

$(function () {
  FastClick.attach(document.body);
});
(function () {
  window.helpers = window.helpers || {};
  window.helpers.getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  };

  // Example
  // var sortBy = getUrlParameter('sort_by')
})();
(function () {
  if (typeof Shopify === 'undefined') {
    Shopify = {};
  }
  if (!Shopify.formatMoney) {
    Shopify.formatMoney = function (cents, format) {
      var value = '',
          placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
          formatString = format || this.money_format;

      if (typeof cents == 'string') {
        cents = cents.replace('.', '');
      }

      function defaultOption(opt, def) {
        return typeof opt == 'undefined' ? def : opt;
      }

      function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = defaultOption(precision, 2);
        thousands = defaultOption(thousands, ',');
        decimal = defaultOption(decimal, '.');

        if (isNaN(number) || number == null) {
          return 0;
        }

        number = (number / 100.0).toFixed(precision);

        var parts = number.split('.'),
            dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
            cents = parts[1] ? decimal + parts[1] : '';

        return dollars + cents;
      }

      switch (formatString.match(placeholderRegex)[1]) {
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

  $(document).ready(function () {
    var sortContainer = $('.js-sort-container');
    var sortTop = $('.js-sort-top');
    var sortDropdown = $('.js-sort-dropdown');

    sortTop.on('click', function () {
      sortContainer.toggleClass('is-open');
      sortDropdown.toggleClass('is-open');
    });

    $('.js-show-plus-sizes').on('click', function (e) {
      e.preventDefault();
      if ($('.c-product__optionItem--sizePlus')) {
        $('.c-product__optionItem--sizePlus').addClass('show-plus-sizes');
      }
    });
  });

  // size grid 
  $(document).ready(function () {

    $('.js-size-type-select').on('click', function () {
      var type;
      var newSection;
      var firstChart;
      if (!$(this).hasClass('is-active')) {
        $('.js-size-type-select.is-active').removeClass('is-active');
        $(this).addClass('is-active');
        type = $(this).attr('data-type-select');
        $('.js-size-type-section').removeClass('is-visible');

        newSection = $('.js-size-type-section[data-type-section="' + type + '"]');
        newSection.addClass('is-visible');
        // firstChart = newSection.find('.js-chart-section:not(.js-chart-section + .js-chart-section)')
        // firstChart.find('.js-chart-dropdown').addClass('is-open')
        // firstChart.find('.js-toggle-chart-dropdown').addClass('is-open')
      }
    });

    $('.js-toggle-chart-dropdown').on('click', function () {
      var toOpenDropdown;
      var typeSection = $(this).closest('.js-size-type-section');

      if ($(this).hasClass('is-open')) {
        // typeSection.find('.js-chart-dropdown.is-open').hide()
        typeSection.find('.js-chart-dropdown.is-open').removeClass('is-open');
        $(this).removeClass('is-open');
      } else {
        typeSection.find('.js-toggle-chart-dropdown').removeClass('is-open');
        // typeSection.find('.js-chart-dropdown.is-open').hide()
        typeSection.find('.js-chart-dropdown.is-open').removeClass('is-open');

        $(this).addClass('is-open');
        var toOpenDropdown = $(this).closest('.js-chart-section').find('.js-chart-dropdown');
        // toOpenDropdown.show();
        toOpenDropdown.addClass('is-open');
      }
    });

    $('.js-search-open').on('click', function (e) {
      e.preventDefault();
      var $this = $(this);

      if (!$this.hasClass('search-is-open')) {
        $this.closest('.c-headerNav--secondary').addClass('search-is-open');
        $this.addClass('search-is-open');
      } else {
        $this.closest('.c-headerNav--secondary').removeClass('search-is-open');
        $this.removeClass('search-is-open');
      }
    });
  });

  $(document).ready(function () {
    var $window = $(window);

    $window.resize(function () {
      if ($window.width() >= 1024) {
        if ($('.c-offcanvas--left').hasClass('offcanvas-open')) {
          $('.c-offcanvas--left .c-offcanvas__close').trigger('click');
        }
      }
    });
  });

  $(document).ready(function () {
    function showRecoverPasswordForm() {
      $('#RecoverPasswordForm').show();
      $('#CustomerLoginForm').hide();
    }

    function hideRecoverPasswordForm() {
      $('#RecoverPasswordForm').hide();
      $('#CustomerLoginForm').show();
    }

    $('#RecoverPassword').on('click', function (evt) {
      evt.preventDefault();
      showRecoverPasswordForm();
    });

    $('#HideRecoverPasswordLink').on('click', function (evt) {
      evt.preventDefault();
      hideRecoverPasswordForm();
    });

    // Allow deep linking to recover password form
    if (window.location.hash == '#recover') {
      showRecoverPasswordForm();
    }
  });
})();

/*!
 * Modal
 * @version 0.0.1
 * @author  Jason Alvis
 */

(function (factory) {
  /* eslint-disable */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module depending on jQuery.
    define(['jquery'], factory);
  } else {
    // No AMD. Register plugin with global jQuery object.
    factory(jQuery);
  }
})(function ($) {
  /* eslint-enable */

  'use strict';

  /**
   * Private variables
   */

  var nameSpace = 'modal';
  var eventNameSpace = '.' + nameSpace;
  var emptyIframe = '//about:blank';

  /**
   * Modal constructor
   * @param {HTMLElement|jQuery} element - The element to create the modal for
   * @param {Object} options             - The options
   */

  var Modal = function Modal(element, options) {
    /**
     * DOM modal element
     * @type {Object}
     */

    this.element = element;

    /**
     * Current options
     * @type {Object}
     */

    this.options = options;

    /**
     * Init
     */

    this.init();
  };

  /**
   * Which transition event
   * Utility method to determine which transistionend event is supported
   * @private
   */

  function whichTransitionEvent() {
    var t;
    var el = document.createElement('fake');
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

  /**
   * Check if we should close or not
   * @param {Object} target - The target
   * @param {Object} modal  - The modal
   * @private
   */

  function checkIfClose(target, modal) {
    var content = modal.modalContent;

    // We close the popup if click is on close button.
    if ($(target).hasClass('js-modal-close') || $(target).parent().hasClass('js-modal-close')) {
      return true;
    }

    // If click is outside the content
    if (target !== content[0] && !$.contains(content[0], target)) {
      // last check, if the clicked element is in DOM, (in case it's removed onclick)
      if ($.contains(document, target)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Bind events
   * @private
   */

  function setFocus() {
    // If a focus element has been specified use it
    // Else just focus the modal
    if (this.options.focus) {
      this.modalContent.find(this.options.focus).eq(0).focus();
    } else {
      this.modal.focus();
    }

    return false;
  }

  /**
   * Bind events
   * @param {Boolean} remove - Remove events
   * @private
   */

  function modalEvents(remove) {
    var _this = this;

    // Overlay
    if (remove) {
      $(this.overlay).off('click' + eventNameSpace);
    } else {
      $(this.overlay).on('click' + eventNameSpace, function () {
        _this.close();
      });
    }

    // Modal (includes close button)
    if (remove) {
      $(this.modal).off('click' + eventNameSpace);
    } else {
      $(this.modal).on('click' + eventNameSpace, function (event) {
        if (checkIfClose(event.target, _this)) {
          _this.close();
        }
      });
    }

    // Close on ESC key
    if (remove) {
      $(document).off('keyup' + eventNameSpace + ' focusin' + eventNameSpace); // includes focusin too
    } else {
      $(document).on('keyup' + eventNameSpace, function (event) {
        if (event.keyCode === 27) {
          _this.close();
        }
      });
    }
  }

  /**
   * Modal trigger events
   * @param {String} event - Callback event name
   * @private
   */

  function modalTrigger(event) {
    if (this.options.callbacks && this.options.callbacks[event]) {
      this.options.callbacks[event].apply(this);
    }
  }

  /**
   * Build functionality
   * @private
   */

  function build() {
    var options = this.options;
    var source;
    var docFrag;

    // Create a DocumentFragment to build with
    // Main containers should only be created only once
    docFrag = document.createDocumentFragment();

    /**
     * Overlay
     */

    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'c-modal-overlay';

      // Add additional class if set
      if (options.modifier) {
        this.overlay.classList.add(options.modifier);
      }

      // Add type modifier classes
      if (options.type) {
        this.overlay.classList.add('c-modal--' + options.type);
      }
    }

    /**
     * Modal
     */

    if (!this.modal) {
      this.modal = document.createElement('div');
      this.modal.className = 'c-modal';
      this.modal.tabIndex = '-1';

      // Add additional class if set
      if (options.modifier) {
        this.modal.classList.add(options.modifier);
      }

      // Add type modifier classes
      if (options.type) {
        this.modal.classList.add('c-modal--' + options.type);
      }
    }

    /**
     * Modal wrap
     */

    if (!this.modalWrap) {
      this.modalWrap = document.createElement('div');
      this.modalWrap.className = 'c-modal__wrap';
    }

    /**
     * Modal inner
     */

    if (!this.modalInner) {
      this.modalInner = document.createElement('div');
      this.modalInner.className = 'c-modal__inner';
    }

    /**
     * Trigger beforeOpen callback
     */

    modalTrigger.call(this, 'beforeOpen');

    /*
     * Build the source.
     */

    if (options.type === 'iframe') {
      source = buildIframe.call(this);
    } else {
      source = buildInline.call(this);
    }

    // If no content build empty markup
    if (!source) {
      source = buildEmpty.call(this);
    }

    // Set the content
    this.modalContent = $(source);

    // Append the source into the holder
    $(this.modalInner).html(source);

    // Append the holder into the wrap
    this.modalWrap.appendChild(this.modalInner);

    // Append the wrap to the modal
    this.modal.appendChild(this.modalWrap);

    // Append overlay to DocumentFragment
    docFrag.appendChild(this.overlay);

    // Append modal to DocumentFragment
    docFrag.appendChild(this.modal);

    // Modal events (add)
    modalEvents.call(this);

    // Append DocumentFragment to body
    document.body.appendChild(docFrag);
  }

  /**
   * Build empty
   * @private
   */

  function buildEmpty() {
    var source = document.createElement('div');
    source.className = 'c-modal__empty';
    source.innerHTML = 'No content found.';

    return source;
  }

  /**
   * Build inline
   * @private
   */

  function buildInline() {
    var source = document.querySelector(this.modalSource);

    // If no source return
    if (!source) {
      return false;
    }

    // Create a placeholder
    var placeholder = document.createElement('div');
    placeholder.classList.add(this.options.hiddenClass);

    // Replace content with a placeholder and store it as the last position
    this.lastPosition = $(placeholder).insertBefore(source);

    // Remove the hidden class from the content so it can display
    source.classList.remove(this.options.hiddenClass);

    // If aria tag exist change the value
    if (source.hasAttribute('aria-hidden')) {
      source.setAttribute('aria-hidden', false);
    }

    // Add close button if required
    if (this.options.showCloseButton === true) {
      if (!this.closeButton) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = this.options.closeMarkup;

        this.closeButton = wrapper.firstChild;
      }

      source.appendChild(this.closeButton);
    }

    return source;
  }

  /**
   * Build iframe
   * @private
   */

  function buildIframe() {
    var iframeOptions = this.options.iframe;
    var source = this.modalSource;

    // Set patterns if none have been passed
    if (!iframeOptions.patterns) {
      iframeOptions.patterns = {
        // http://www.youtube.com/watch?v=<id>
        youtube: {
          index: 'youtube.com',
          id: 'v=',
          src: '//www.youtube.com/embed/%id%?autoplay=1&showinfo=0&rel=0'
        },
        // http://vimeo.com/<id>
        vimeo: {
          index: 'vimeo.com/',
          id: '/',
          src: '//player.vimeo.com/video/%id%?autoplay=1'
        }
      };
    }

    // Set markup if none has been passed
    if (!iframeOptions.markup) {
      iframeOptions.markup = '<div class="c-modal__iframeWrap">' + this.options.closeMarkup + '<iframe class="c-modal__iframe" src="' + emptyIframe + '" frameborder="0" allowfullscreen></iframe>' + '</div>';
    }

    // Loop through each pattern
    $.each(iframeOptions.patterns, function () {
      if (source.indexOf(this.index) > -1) {
        if (this.id) {
          if (typeof this.id === 'string') {
            source = source.substr(source.lastIndexOf(this.id) + this.id.length, source.length);
          } else {
            source = this.id.call(this, source);
          }
        }

        source = this.src.replace('%id%', source);

        return false;
      }
    });

    // Build markup
    source = $(iframeOptions.markup.replace(emptyIframe, source));

    return source;
  }

  /**
   * Default options
   * @public
   */

  Modal.prototype.defaults = {
    showCloseButton: true,
    closeMarkup: '<button type="button" class="js-modal-close c-modal__close" aria-label="Close">\n        <svg class="c-modal__closeIcon" width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n            <g id="category" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">\n                <g id="375-04-category-sort@2x" transform="translate(-329.000000, -30.000000)" stroke-width="2" stroke="#000000">\n                    <g id="icon-close" transform="translate(330.000000, 31.000000)">\n                        <g id="error-1">\n                            <path d="M0,0 L14,14" id="Line"></path>\n                            <path d="M0,0 L14,14" id="Line-Copy" transform="translate(7.000000, 7.000000) scale(-1, 1) translate(-7.000000, -7.000000) "></path>\n                        </g>\n                    </g>\n                </g>\n            </g>\n        </svg>\n    </button>',
    hiddenClass: 'u-hide',
    openClass: 'modal-open',
    modifier: null,
    focus: null,
    type: null,
    iframe: {},
    callbacks: null
  };

  /**
   * Init the modal
   * @public
   */

  Modal.prototype.init = function () {
    // Introduce defaults that can be extended either
    // globally or using an object literal.
    this.options = $.extend({}, this.defaults, this.options);

    // Get the source
    this.modalSource = this.element.hasAttribute('data-modal-src') ? this.element.getAttribute('data-modal-src') : this.element.getAttribute('href');

    // Add click listener
    $(this.element).on('click' + eventNameSpace, $.proxy(this.open, this));

    return this;
  };

  /**
   * Open
   * @public
   */

  Modal.prototype.open = function (event) {
    var _this = this;
    var transitionEvent = whichTransitionEvent();

    // Prevent default if event exists
    if (event && event.type) {
      event.preventDefault();

      // In case its already open, don't open any more
      if (this.isOpen) {
        event.stopPropagation();
      }
    }

    // Build the modal
    build.call(this);

    // Save last focused element
    this.lastFocusedElement = document.activeElement;

    /*
     * After adding elements to the DOM, use getComputedStyle
     * to force the browser to recalc and recognize the elements
     * that we just added. This is so that CSS animation has a start point
     */

    window.getComputedStyle(this.modal).height;

    // Add the open class name
    document.body.classList.add(this.options.openClass);
    this.modal.classList.add(this.options.openClass);
    this.overlay.classList.add(this.options.openClass);

    // Trap the focus in popup after its finished transitioning
    $(this.modal).one(transitionEvent, function () {
      $(document).on('focusin' + eventNameSpace, setFocus.call(_this));
    });

    // Set status to open
    this.isOpen = true;

    /**
     * Trigger open callback
     */

    modalTrigger.call(this, 'open');
  };

  /**
   * Close
   * @public
   */

  Modal.prototype.close = function () {
    // If its not open do nothing
    if (!this.isOpen) {
      return;
    }

    /**
     * Trigger beforeClose callback
     */

    modalTrigger.call(this, 'beforeClose');

    var _this = this;
    var options = this.options;
    var overlay = this.overlay;
    var modal = this.modal;
    var content = this.modalContent;
    var transitionEvent = whichTransitionEvent();

    // Remove the open class name
    document.body.classList.remove(options.openClass);
    modal.classList.remove(options.openClass);
    overlay.classList.remove(options.openClass);

    // Set status to false
    this.isOpen = false;

    // Overlay transition event
    $(overlay).one(transitionEvent, function () {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });

    // Modal transition event
    $(modal).one(transitionEvent, function () {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }

      // Iframe (remove the src)
      if (options.type === 'iframe') {
        _this.modalContent.find('iframe')[0].src = emptyIframe;
      }

      // If last position exists the content has been moved and we need to put it back
      if (_this.lastPosition) {
        // Add the hidden class to the content
        content.addClass(options.hiddenClass);

        // Remove the close button if we added one
        if (options.showCloseButton === true) {
          content.find(_this.closeButton).remove();
        }

        // If aria tag exist change the value
        if (content.attr('aria-hidden')) {
          content.attr('aria-hidden', true);
        }

        // Insert the content back to its last position
        _this.lastPosition.after(content);

        // Remove the placeholder from the dom
        _this.lastPosition.remove();

        // Set the placeholder back to null
        _this.lastPosition = null;
      }
    });

    // Modal events (remove)
    modalEvents.call(this, true);

    // Put focus back on the last focused element
    if (this.lastFocusedElement) {
      $(this.lastFocusedElement).focus();
    }

    /**
     * Trigger close callback
     */

    modalTrigger.call(_this, 'close');
  };

  /**
   * jQuery Modal interface
   * @param  {Object} options - The options
   * @return {Object}         - The modal object
   */

  $.fn.modal = function (options) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      var item = $(this),
          data = item.data('modal');

      if (!data) {
        // create modal data if not created
        item.data('modal', new Modal(this, options));
      } else {
        // otherwise check arguments for method call
        if (typeof options === 'string') {
          data[options].apply(data, args);
        }
      }
    });
  };
});

/*!
 * Offcanvas
 * @version 0.0.1
 * @author  Jason Alvis
 */

(function (factory) {
  /* eslint-disable */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module depending on jQuery.
    define(['jquery'], factory);
  } else {
    // No AMD. Register plugin with global jQuery object.
    factory(jQuery);
  }
})(function ($) {
  /* eslint-enable */

  'use strict';

  /**
   * Private variables
   */

  var nameSpace = 'offcanvas';
  var eventNameSpace = '.' + nameSpace;
  var isOpen = false;
  var overlay;

  /**
   * Offcanvas constructor
   * @param {HTMLElement|jQuery} element - The element to create the offcanvas for
   * @param {Object} options             - The options
   */

  var Offcanvas = function Offcanvas(element, options) {
    /**
     * DOM offcanvas element
     * @type {Object}
     */

    this.element = element;

    /**
     * Current options
     * @type {Object}
     */

    this.options = options;

    /**
     * Init
     */

    this.init();
  };

  /**
   * Which transition event
   * Utility method to determine which transistionend event is supported
   * @private
   */

  function whichTransitionEvent() {
    var t;
    var el = document.createElement('fake');
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

  /**
   * Offcanvas trigger events
   * @param {String} event - Callback event name
   * @private
   */

  function offcanvasTrigger(event) {
    if (this.options.callbacks && this.options.callbacks[event]) {
      this.options.callbacks[event].apply(this);
    }
  }

  /**
   * Build functionality
   * @private
   */

  function build() {
    var docFrag;

    // Create a DocumentFragment to build with
    // Main containers should only be created only once
    docFrag = document.createDocumentFragment();

    if (!overlay) {
      overlay = document.createElement('a');
      overlay.className = 'c-offcanvas-overlay';
      overlay.setAttribute('href', '#');
      overlay.innerHTML = '<span class="u-hideVisually">Exit Menu</span>';
    }

    // Append overlay markup to DocumentFragment
    docFrag.appendChild(overlay);

    // Append DocumentFragment to body
    document.body.appendChild(docFrag);

    // Add click event to overlay markup
    $(overlay).on('click' + eventNameSpace, $.proxy(this.close, this));
  }

  /**
   * Default options
   * @public
   */

  Offcanvas.prototype.defaults = {
    openClass: 'offcanvas-open',
    closeElement: '.c-offcanvas__close',
    showOverlay: true,
    callbacks: null
  };

  /**
   * Init the offcanvas
   * @public
   */

  Offcanvas.prototype.init = function () {
    // Introduce defaults that can be extended either
    // globally or using an object literal.
    this.options = $.extend({}, this.defaults, this.options);

    // Get the source
    this.offcanvasSource = this.element.hasAttribute('data-offcanvas-src') ? this.element.getAttribute('data-offcanvas-src') : this.element.getAttribute('href');

    // Get the content
    this.offcanvasContent = document.querySelector(this.offcanvasSource);

    // If no content do nothing
    if (!this.offcanvasContent) {
      return;
    }

    // Add click listener to element
    $(this.element).on('click' + eventNameSpace, $.proxy(this.toggle, this));

    return this;
  };

  /**
   * Toggle
   * @public
   */

  Offcanvas.prototype.toggle = function (event) {
    // Prevent default if event exists
    if (event && event.type) {
      event.preventDefault();
    }

    // Toggle open/close class
    if (!isOpen) {
      this.open();
    } else {
      this.close();
    }
  };

  /**
   * Open
   * @public
   */

  Offcanvas.prototype.open = function () {
    var _this = this;

    /**
     * Trigger beforeOpen callback
     */

    offcanvasTrigger.call(this, 'beforeOpen');

    // Aria tags
    this.element.setAttribute('aria-expanded', true);
    this.offcanvasContent.setAttribute('aria-hidden', false);

    // Build overlay
    if (this.options.showOverlay) {
      build.call(this);
    }

    // Bind click to close element
    $(this.options.closeElement).on('click' + eventNameSpace, $.proxy(this.close, this));

    // Bind ESC to close element
    $(document).on('keyup' + eventNameSpace, function (event) {
      if (event.keyCode === 27) {
        _this.close();
      }
    });

    // Add open class to elements
    setTimeout(function () {
      _this.offcanvasContent.classList.add(_this.options.openClass);
      document.querySelector('body').classList.add(_this.options.openClass);
    }, 20);

    // Set status
    isOpen = true;

    /**
     * Trigger open callback
     */

    offcanvasTrigger.call(this, 'open');
  };

  /**
   * Close
   * @public
   */

  Offcanvas.prototype.close = function (event) {
    // Prevent default if event exists
    if (event && event.type) {
      event.preventDefault();
    }

    /**
     * Trigger beforeClose callback
     */

    offcanvasTrigger.call(this, 'beforeClose');

    // Aria tags
    this.element.setAttribute('aria-expanded', false);
    this.offcanvasContent.setAttribute('aria-hidden', true);

    // Overlay
    if (this.options.showOverlay) {
      var transitionEvent = whichTransitionEvent();

      // Remove click event from overlay markup
      $(overlay).off('click' + eventNameSpace);

      // Remove overlay markup when transition had finished
      $(overlay).one(transitionEvent, function () {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      });
    }

    // Remove click event from close element
    $(this.options.closeElement).off('click' + eventNameSpace);

    // Remove ESC event to close element
    $(document).off('keyup' + eventNameSpace);

    // Remove open class from elements
    this.offcanvasContent.classList.remove(this.options.openClass);
    document.querySelector('body').classList.remove(this.options.openClass);

    // Set status
    isOpen = false;

    /**
     * Trigger close callback
     */

    offcanvasTrigger.call(this, 'close');
  };

  /**
   * jQuery Offcanvas interface
   * @param  {Object} options - The options
   * @return {Object}         - The offcanvas object
   */

  $.fn.offcanvas = function (options) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      var item = $(this),
          data = item.data('offcanvas');

      if (!data) {
        // create offcanvas data if not created
        item.data('offcanvas', new Offcanvas(this, options));
      } else {
        // otherwise check arguments for method call
        if (typeof options === 'string') {
          data[options].apply(data, args);
        }
      }
    });
  };
});

(function () {
  var width = window.innerWidth;
  var controller = new ScrollMagic.Controller();
  var duration;
  var durationValueCache;
  var mobileScreenWidth = width <= 767 ? true : false;

  function getDuration() {
    var offsetEl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (offsetEl) {
      // return offset to cached height
      return durationValueCache + $(offsetEl).height();
    } else {
      // return cached height
      return durationValueCache;
    }
  }

  function updateDuration(e) {
    durationValueCache = window.innerHeight;
  }

  // update duration on resize
  $(window).on("resize", updateDuration);

  // set initial value
  $(window).triggerHandler("resize");

  if (!mobileScreenWidth) {
    // Home Hero Text -- Desktop
    if ($('.js-animElement__HomeHeroText--desktop').length) {
      new ScrollMagic.Scene({
        triggerHook: 0,
        offset: 0,
        duration: $('.js-animElement__HomeHeroText--desktop').offset().top + $('.js-animElement__HomeHeroText--desktop').height()
      }).setTween('.js-animElement__HomeHeroText--desktop', { xPercent: 15 })
      // .addIndicators()
      .addTo(controller);
    }
  }

  if (width >= 1024) {
    // Home Alcoholidays Text -- Desktop
    if ($('.js-animElement__alcoholidaysText--desktop').length) {
      new ScrollMagic.Scene({
        triggerHook: 1,
        triggerElement: '.js-animTrigger__alcoholidaysText--desktop',
        duration: getDuration($('.js-animTrigger__alcoholidaysText--desktop'))
      }).setTween('.js-animElement__alcoholidaysText--desktop', { x: 0 })
      // .addIndicators()
      .addTo(controller);
    }
  }

  if (!mobileScreenWidth) {
    // Home Collection Hero
    if ($('.js-animElement__colHeroText').length) {
      new ScrollMagic.Scene({
        triggerHook: 0,
        offset: 0,
        duration: $('.js-animElement__colHeroText').offset().top + $('.js-animElement__colHeroText').height()
      }).setTween('.js-animElement__colHeroText', { xPercent: 25 })
      // .addIndicators()
      .addTo(controller);
    }
  }

  if (width >= 768) {
    // product animation
    // console.log('duration', $('.js-animTrigger__productImageSection').height() - $('.js-animElement__productInfoSection').outerHeight())
    console.log($('.js-animTrigger__productImageSection').height());
    console.log($('.js-animElement__productInfoSection').outerHeight());

    if ($('.js-animTrigger__productImageSection').length) {
      if ($('.js-animTrigger__productImageSection').height() - $('.js-animElement__productInfoSection').outerHeight() > 0) {
        new ScrollMagic.Scene({
          triggerHook: 0,
          offset: 0,
          triggerElement: '.c-product__inner',
          duration: $('.js-animTrigger__productImageSection').height() - $('.js-animElement__productInfoSection').outerHeight()
        }).setPin('.js-animElement__productInfoSection', { pushFollowers: false }) // default true
        // .addIndicators()
        .addTo(controller);
      }
    }
  }
})();
(function () {

  var width = window.innerWidth;
  var isMobileLarge = 640 <= width && width <= 767;

  var prevArrow = ' \n        <svg class="c-sliderArrow c-sliderArrow--left" width="18px" height="34px" viewBox="0 0 18 34" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n            <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n                <g id="375-celebs" transform="translate(-243.000000, -121.000000)" fill="#000000">\n                    <g id="celebs">\n                        <g id="arrows" transform="translate(243.000000, 121.000000)">\n                            <polygon id="left" points="0 17 16.2580645 34 18 32.1785714 3.48387097 17 18 1.82142857 16.2580645 0"></polygon>\n                        </g>\n                    </g>\n                </g>\n            </g>\n        </svg>';
  var nextArrow = '\n            <svg class="c-sliderArrow c-sliderArrow--right" width="18px" height="34px" viewBox="0 0 18 34" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n            <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n                <g id="375-celebs" transform="translate(-576.000000, -121.000000)" fill="#000000">\n                    <g id="celebs">\n                        <g id="arrows" transform="translate(243.000000, 121.000000)">\n                            <polygon id="right" transform="translate(342.000000, 17.000000) rotate(-180.000000) translate(-342.000000, -17.000000) " points="333 17 349.258065 34 351 32.1785714 336.483871 17 351 1.82142857 349.258065 0"></polygon>\n                        </g>\n                    </g>\n                </g>\n            </g>\n        </svg>';

  var hpCustomGridSliderSettings = {
    mobileFirst: true,
    centerMode: true,
    centerPadding: '46px',
    slidesToShow: 1,
    infinite: false,
    responsive: [{
      breakpoint: 640,
      initialSlide: 1,
      settings: {
        slidesToShow: 2,
        initialSlide: 1
      }
    }, {
      breakpoint: 768,
      settings: "unslick"
    }],
    prevArrow: prevArrow,
    nextArrow: nextArrow
  };

  var hpProductsSliderSettings = {
    mobileFirst: true,
    centerMode: true,
    centerPadding: '46px',
    slidesToShow: 1,
    infinite: false,
    responsive: [{
      breakpoint: 640,
      initialSlide: 1,
      settings: {
        slidesToShow: 2,
        initialSlide: 1
      }
    }, {
      breakpoint: 768,
      settings: "unslick"
    }],
    prevArrow: prevArrow,
    nextArrow: nextArrow
  };

  var productImageSliderSettings = {
    mobileFirst: true,
    centerMode: true,
    centerPadding: '46px',
    slidesToShow: 1,
    infinite: true,
    responsive: [{
      breakpoint: 640,
      initialSlide: 1,
      settings: {
        slidesToShow: 2,
        initialSlide: 1
      }
    }, {
      breakpoint: 768,
      settings: "unslick"
    }],
    prevArrow: prevArrow,
    nextArrow: nextArrow
  };

  var productRelatedProductsSettings = {
    mobileFirst: true,
    centerMode: true,
    centerPadding: '46px',
    slidesToShow: 1,
    infinite: true,
    responsive: [{
      breakpoint: 640,
      initialSlide: 1,
      settings: {
        slidesToShow: 2,
        initialSlide: 1
      }
    }, {
      breakpoint: 768,
      settings: "unslick"
    }],
    prevArrow: prevArrow,
    nextArrow: nextArrow
  };

  var hpInstagramGridSliderSettings = {
    mobileFirst: true,
    centerMode: true,
    centerPadding: '46px',
    slidesToShow: 1,
    infinite: false,
    responsive: [{
      breakpoint: 768,
      settings: "unslick"
    }],
    prevArrow: prevArrow,
    nextArrow: nextArrow
  };

  function waitForEl(selector, callback) {
    if (jQuery(selector).length) {
      callback();
    } else {
      setTimeout(function () {
        waitForEl(selector, callback);
      }, 100);
    }
  }

  function twoCenterSlides(slider) {
    slider.on('init', function (event, slick) {
      slider.find('.slick-current').prev().addClass('slick-current-override');
    });

    slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
      var nextCurrentSlideEl = $('[data-slick-index=\'' + nextSlide + '\']');
      $('.slick-current-override').removeClass('slick-current-override');
      $(nextCurrentSlideEl).prev().addClass('slick-current-override');
    });
  }

  // disable non current slides that are links
  $('.slick-slide:not(.slick-active)').on('click', function (event) {
    event.preventDefault();
  });

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
  waitForEl('.fs-timeline-entry', function () {
    $('.c-hpIGridSection .fs-timeline').slick(hpInstagramGridSliderSettings);
  });

  // init product sliders
  productImageSlider.slick(productImageSliderSettings);
  productRelatedProductsSlider.slick(productRelatedProductsSettings);
})();
//# sourceMappingURL=components.js.map
