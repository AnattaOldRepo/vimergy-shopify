'use strict';

console.log("App.js is ready now!!");

$('.js-modal').modal();

$('.js-offcanvas').offcanvas({
    callbacks: {
        beforeOpen: function beforeOpen() {},

        open: function open() {},

        beforeClose: function beforeClose() {},

        close: function close() {}
    }
});

$('.lazy-load').Lazy();
//# sourceMappingURL=app.js.map
