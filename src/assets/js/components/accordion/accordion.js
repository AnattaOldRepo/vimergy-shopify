/*!
 * Accordion
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
  
    var nameSpace = 'accordion';
    var eventNameSpace = '.' + nameSpace; 
  
    /**
     * Accordion constructor
     * @param {HTMLElement|jQuery} element - The element to create the accordion for
     * @param {Object} options             - The options
     */
  
    var Accordion = function(element, options) {
      /**
       * DOM accordion element
       * @type {Object}
       */
  
      this.element = element;
  
      /**
       * DOM accordion element wrapped in jQuery
       * @type {Object}
       */
  
      this.$element = $(element);
  
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
     * Accordion trigger events
     * @param {String} event - Callback event name
     * @private   
     */
  
    function accordionTrigger(event) {
      if(this.options.callbacks && this.options.callbacks[event]) {
        this.options.callbacks[event].apply(this);
      }
    }
    
    /**
     * Default options
     * @public   
     */
  
    Accordion.prototype.defaults = {
      activeClass: 'is-active',
      callbacks: null
    };
  
    /**
     * Init the accordion
     * @public
     */
  
    Accordion.prototype.init = function() { 
      // Introduce defaults that can be extended either
      // globally or using an object literal.
      this.options = $.extend({}, this.defaults, this.options);
  
      // Get the items
      this.accordionNav = this.$element.find('dt');
  
      // Get the panels
      this.accordionPanels = this.$element.find('dd');
  
      // Add click listener to nav item
      this.accordionNav.on('click' + eventNameSpace, $.proxy(this.toggle, this));
  
      return this;
    };
  
    /**
     * Toggle the accordion
     * @public
     */
  
    Accordion.prototype.toggle = function() {
      var index = this.accordionNav.index( $(event.currentTarget) );
      var i;
  
      /**
       * Trigger beforeOpen callback
       */
  
      accordionTrigger.call(this, 'beforeOpen');    
  
      // Loop through each nav item and toggle the attributes
      for (i = 0; i < this.accordionNav.length; i++) {
        // Classes
        this.accordionNav[i].classList.remove(this.options.activeClass);
        this.accordionNav[index].classList.add(this.options.activeClass);
        
        // Attributes
        this.accordionNav[i].setAttribute('aria-selected', false);
        this.accordionNav[index].setAttribute('aria-selected', true);
      }
  
      // Loop through each panel and toggle the attributes
      for (i = 0; i < this.accordionPanels.length; i++) { 
        // Classes
        this.accordionPanels[i].classList.remove(this.options.activeClass);
        this.accordionPanels[index].classList.add(this.options.activeClass);
  
        // Attributes
        this.accordionPanels[i].setAttribute('aria-hidden', true);
        this.accordionPanels[index].setAttribute('aria-hidden', false);      
      }
  
      /**
       * Trigger open callback
       */
  
      accordionTrigger.call(this, 'open');        
    };
  
    /**
     * jQuery Accordion interface
     * @param  {Object} options - The options
     * @return {Object}         - The accordion object
     */
  
    $.fn.accordion = function(options) {
      var args = Array.prototype.slice.call(arguments, 1);
  
      return this.each(function() {
        var item = $(this),
          data = item.data('accordion');
  
        if (!data) {
          // create accordion data if not created
          item.data('accordion', new Accordion(this, options));
        } else {
          // otherwise check arguments for method call
          if (typeof options === 'string') {
            data[options].apply(data, args);
          }
        }
      });
    };
  }));