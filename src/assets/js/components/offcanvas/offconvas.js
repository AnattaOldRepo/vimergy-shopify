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
}(function ($) {
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

  var Offcanvas = function(element, options) {
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
      'transition':'transitionend',
      'OTransition':'oTransitionEnd',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };

    for(t in transitions){
      if( el.style[t] !== undefined ){
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
    if(this.options.callbacks && this.options.callbacks[event]) {
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

    if(!overlay) {
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

  Offcanvas.prototype.init = function() {
    // Introduce defaults that can be extended either
    // globally or using an object literal.
    this.options = $.extend({}, this.defaults, this.options);

    // Get the source
    this.offcanvasSource = this.element.hasAttribute('data-offcanvas-src') ? this.element.getAttribute('data-offcanvas-src') : this.element.getAttribute('href');

    // Get the content
    this.offcanvasContent = document.querySelector(this.offcanvasSource);

    // If no content do nothing
    if(!this.offcanvasContent) {
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

  Offcanvas.prototype.toggle = function(event) {
    // Prevent default if event exists
    if(event && event.type) {
      event.preventDefault();
    }

    // Toggle open/close class
    if(!isOpen) {
      this.open();
    } else {
      this.close();
    }
  };

  /**
   * Open
   * @public
   */

  Offcanvas.prototype.open = function() {
    var _this = this;

    /**
     * Trigger beforeOpen callback
     */

    offcanvasTrigger.call(this, 'beforeOpen');

    // Aria tags
    this.element.setAttribute('aria-expanded', true);
    this.offcanvasContent.setAttribute('aria-hidden', false);

    // Build overlay
    if(this.options.showOverlay) {
      build.call(this);
    }

    // Bind click to close element
    $(this.options.closeElement).on('click' + eventNameSpace, $.proxy(this.close, this));

    // Bind ESC to close element
    $(document).on('keyup' + eventNameSpace, function(event) {
      if(event.keyCode === 27) {
        _this.close();
      }
    });

    // Add open class to elements
    setTimeout(function() {
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

  Offcanvas.prototype.close = function(event) {
    // Prevent default if event exists
    if(event && event.type) {
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
    if(this.options.showOverlay) {
      var transitionEvent = whichTransitionEvent();

      // Remove click event from overlay markup
      $(overlay).off('click' + eventNameSpace);

      // Remove overlay markup when transition had finished
      $(overlay).one(transitionEvent, function() {
        if(overlay.parentNode) {
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

  $.fn.offcanvas = function(options) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function() {
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
}));
