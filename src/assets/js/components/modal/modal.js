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
}(function ($) {
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

  var Modal = function(element, options) {
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
   * Check if we should close or not
   * @param {Object} target - The target
   * @param {Object} modal  - The modal
   * @private
   */

  function checkIfClose(target, modal) {
    var content = modal.modalContent;

    // We close the popup if click is on close button.
    if($(target).hasClass('js-modal-close') || $(target).parent().hasClass('js-modal-close')) {
      return true;
    }

    // If click is outside the content
    if( (target !== content[0] && !$.contains(content[0], target)) ) {
      // last check, if the clicked element is in DOM, (in case it's removed onclick)
      if( $.contains(document, target) ) {
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
    if(this.options.focus) {
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
    if(remove) {
      $(this.overlay).off('click' + eventNameSpace);
    } else {
      $(this.overlay).on('click' + eventNameSpace, function() {
        _this.close();
      });
    }

    // Modal (includes close button)
    if(remove) {
      $(this.modal).off('click' + eventNameSpace);
    } else {
      $(this.modal).on('click' + eventNameSpace, function(event) {
        if(checkIfClose(event.target, _this)) {
          _this.close();
        }
      });
    }

		// Close on ESC key
    if(remove) {
      $(document).off('keyup' + eventNameSpace + ' focusin' + eventNameSpace); // includes focusin too
    } else {
      $(document).on('keyup' + eventNameSpace, function(event) {
        if(event.keyCode === 27) {
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
    if(this.options.callbacks && this.options.callbacks[event]) {
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

    if(!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'c-modal-overlay';

      // Add additional class if set
      if(options.modifier) {
        this.overlay.classList.add(options.modifier);
      }

      // Add type modifier classes
      if(options.type) {
        this.overlay.classList.add('c-modal--' + options.type);
      }
    }

    /**
     * Modal
     */

    if(!this.modal) {
      this.modal = document.createElement('div');
      this.modal.className = 'c-modal';
      this.modal.tabIndex = '-1';

      // Add additional class if set
      if(options.modifier) {
        this.modal.classList.add(options.modifier);
      }

      // Add type modifier classes
      if(options.type) {
        this.modal.classList.add('c-modal--' + options.type);
      }
    }

    /**
     * Modal wrap
     */

    if(!this.modalWrap) {
      this.modalWrap = document.createElement('div');
      this.modalWrap.className = 'c-modal__wrap';
    }

    /**
     * Modal inner
     */

    if(!this.modalInner) {
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

    if(options.type === 'iframe') {
      source = buildIframe.call(this);
    } else {
      source = buildInline.call(this);
    }

    // If no content build empty markup
    if(!source) {
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
    if(!source) {
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
    if(source.hasAttribute('aria-hidden')) {
      source.setAttribute('aria-hidden', false);
    }

    // Add close button if required
    if(this.options.showCloseButton === true) {
      if(!this.closeButton) {
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
    if(!iframeOptions.patterns) {
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
    if(!iframeOptions.markup) {
        iframeOptions.markup = '<div class="c-modal__iframeWrap">' + this.options.closeMarkup + '<iframe class="c-modal__iframe" src="' + emptyIframe + '" frameborder="0" allowfullscreen></iframe>' + '</div>';
    }

    // Loop through each pattern
    $.each(iframeOptions.patterns, function() {
      if(source.indexOf(this.index) > -1) {
        if(this.id) {
          if(typeof this.id === 'string') {
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
    closeMarkup: `<button type="button" class="js-modal-close c-modal__close" aria-label="Close">
        <svg class="c-modal__closeIcon" width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="category" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                <g id="375-04-category-sort@2x" transform="translate(-329.000000, -30.000000)" stroke-width="2" stroke="#000000">
                    <g id="icon-close" transform="translate(330.000000, 31.000000)">
                        <g id="error-1">
                            <path d="M0,0 L14,14" id="Line"></path>
                            <path d="M0,0 L14,14" id="Line-Copy" transform="translate(7.000000, 7.000000) scale(-1, 1) translate(-7.000000, -7.000000) "></path>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    </button>`,
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

  Modal.prototype.init = function() {
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

  Modal.prototype.open = function(event) {
    var _this = this;
    var transitionEvent = whichTransitionEvent();

    // Prevent default if event exists
    if(event && event.type) {
      event.preventDefault();

      // In case its already open, don't open any more
      if(this.isOpen) {
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
    $(this.modal).one(transitionEvent, function() {
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

  Modal.prototype.close = function() {
    // If its not open do nothing
    if(!this.isOpen) {
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
    $(overlay).one(transitionEvent, function() {
      if(overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });

    // Modal transition event
    $(modal).one(transitionEvent, function() {
      if(modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }

      // Iframe (remove the src)
      if(options.type === 'iframe') {
        _this.modalContent.find('iframe')[0].src = emptyIframe;
      }

      // If last position exists the content has been moved and we need to put it back
      if(_this.lastPosition) {
        // Add the hidden class to the content
        content.addClass(options.hiddenClass);

        // Remove the close button if we added one
        if(options.showCloseButton === true) {
          content.find(_this.closeButton).remove();
        }

        // If aria tag exist change the value
        if(content.attr('aria-hidden')) {
          content.attr('aria-hidden', true);
        }

        // Insert the content back to its last position
        _this.lastPosition.after( content );

        // Remove the placeholder from the dom
        _this.lastPosition.remove();

        // Set the placeholder back to null
        _this.lastPosition = null;
      }
    });

    // Modal events (remove)
    modalEvents.call(this, true);

    // Put focus back on the last focused element
    if(this.lastFocusedElement) {
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

  $.fn.modal = function(options) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function() {
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
}));
