console.log("App.js is ready now!!");

$('.js-modal').modal();

$('.js-offcanvas').offcanvas({
    callbacks: {
        beforeOpen: function() {

        },

        open: function() {

        },

        beforeClose: function() {

        },

        close: function() {

        }
    }
});

$('.lazy-load').Lazy();
