'use strict';

/*
@Author - Monkviper
@Company - AnattaDesign
@Version - 0.0.2
@Description - Shopify theme development build system
*/

// General packages
const argv = require('yargs').argv;
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const del = require('del');
const rename = require('gulp-rename');
const changed = require('gulp-changed');
const replace = require('gulp-replace');
const plumber = require('gulp-plumber');
const print = require('gulp-print');
const notify = require('gulp-notify');

// Css ackages
const postCss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const cssImport = require("postcss-import");
const cssUrl = require("postcss-url");
const cssNext = require("postcss-cssnext");
const preCss = require("precss");
const fontPath = require("postcss-fontPath");
const at2x = require("postcss-at2x");
const flexBox = require("postcss-flexbox");
const utilities = require("postcss-utilities");
const short = require("postcss-short");
const autoMath = require("postcss-automath");
const zindex = require("postcss-zindex");
const colorFunction = require("postcss-color-function");
const lost = require('lost');
const stylelint = require("stylelint");

// Javascript ackages
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const babelcore = require('babel-core');
const babel = require('gulp-babel');
const debug = require('postcss-debug').createDebugger();

// Shopify packages
if (!argv.production) {
    var theme = require('gulp-shopify-theme').create();
    var shopifyConfig = require('./shopifyconfig.json');
}

// Extends source mapping with liquid
const sourceMappingURLCSSregExp = new RegExp('(.*?[/*]{2,}# sourceMappingURL=)(.*?)([/*]{2})', 'g');
const sourceMappingURLJSregExp = new RegExp('(.*?[/*]{2,}# sourceMappingURL=)(.*?)', 'g');
const sourceMappingURLCSSreplace = '{% raw %}$1{% endraw %}$2{% raw %}$3{% endraw %}';
const sourceMappingURLJSreplace = '{% raw %}$1{% endraw %}$2';

// Path object
var paths = {
    shopifySource: 'src/{layout,snippets,sections,templates}/**/*.*',
    shopifyDestination: 'dist',
    shopifyAssets: 'dist/assets',
    scripts: {
        dir: 'src/assets/js/**/*.js',
        app: {
            input: 'src/assets/js/app.js',
        },
        components: {
            input: 'src/assets/js/components/**/*'
        },
        vue: {
            input: 'src/assets/js/vue/**/*'
        }
    },
    css: {
        input: 'src/assets/css/app.css',
        dir: 'src/assets/{css,css-libs}/**/*.{css,less,scss,liquid}'
    },
    fonts: {
        input: 'src/assets/fonts/**/*.{ttf,woff,woff2,eof,eot,otf,svg}'
    },
    images: {
        input: 'src/assets/images/**/*.{svg,png,jpg,jpeg,gif,ico}'
    },
    static: {
        input: 'scr/assets/static/**/*'
    }
};

const onError = function(error) {
    notify.onError('Error: notify.onError("Error: <%= error.message %>")')
}

// Initialize shopify theme configurations
gulp.task('theme', function() {
    theme.init(shopifyConfig);
});

// Css
gulp.task('css', function() {
    var processors = [
        cssImport(),
        cssUrl(),
        cssNext(),
        preCss(),
        fontPath(),
        at2x(),
        flexBox(),
        utilities(),
        short(),
        autoMath(),
        zindex(),
        colorFunction(),
        lost()
    ];
    return gulp.src(paths.css.input)
        .pipe(plumber())
        .pipe(gulpIf(!argv.production, sourcemaps.init()))
        .pipe(postCss(debug(processors)))
        .pipe(gulpIf(argv.production, postCss([
            require('cssnano')
        ])))
        .pipe(gulpIf(!argv.production, sourcemaps.write('.')))
        .pipe(gulp.dest(paths.shopifyAssets))
        .pipe(gulpIf(!argv.production, ("undefined" != typeof theme) ? theme.stream():'fake'))
});

// Javascript components
gulp.task('jsComponents', function() {
    return gulp.src(paths.scripts.components.input)
        .pipe(plumber())
        .pipe(gulpIf(!argv.production, sourcemaps.init()))
        .pipe(concat('components.js'))
        .pipe(babel({
            presets: ['latest']
        }))
        .pipe(gulpIf(argv.production, uglify()))
        .pipe(gulpIf(!argv.production, sourcemaps.write('.')))
        .pipe(rename(appendLiquidExt))
        .pipe(replace(sourceMappingURLJSregExp, sourceMappingURLJSreplace))
        .pipe(gulp.dest(paths.shopifyAssets))
        .pipe(gulpIf(!argv.production, ("undefined" != typeof theme) ? theme.stream():'fake'))
});

// Javascript app file
gulp.task('jsApp', function() {
    return gulp.src(paths.scripts.app.input)
        .pipe(plumber())
        .pipe(gulpIf(!argv.production, sourcemaps.init()))
        .pipe(babel({
            presets: ['latest']
        }))
        .pipe(gulpIf(argv.production, uglify()))
        .pipe(gulpIf(!argv.production, sourcemaps.write('.')))
        .pipe(rename(appendLiquidExt))
        .pipe(replace(sourceMappingURLJSregExp, sourceMappingURLJSreplace))
        .pipe(gulp.dest(paths.shopifyAssets))
        .pipe(gulpIf(!argv.production, ("undefined" != typeof theme) ? theme.stream():'fake'))
});

// Javascript components
gulp.task('jsVue', function() {
    return gulp.src(paths.scripts.vue.input)
        .pipe(plumber())
        .pipe(gulpIf(!argv.production, sourcemaps.init()))
        .pipe(concat('vue-components.js'))
        .pipe(babel({
            presets: ['latest']
        }))
        .pipe(gulpIf(argv.production, uglify()))
        .pipe(gulpIf(!argv.production, sourcemaps.write('.')))
        .pipe(gulp.dest(paths.shopifyAssets))
        .pipe(gulpIf(!argv.production, ("undefined" != typeof theme) ? theme.stream():'fake'))
});

// fonts
gulp.task('fonts', function() {
    return gulp.src(paths.fonts.input)
        .pipe(plumber())
        .pipe(changed(paths.shopifyDestination, {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(rename(flatten))
        .pipe(gulp.dest(paths.shopifyAssets))
        .pipe(gulpIf(!argv.production, ("undefined" != typeof theme) ? theme.stream():'fake'))
});

// images
gulp.task('images', function() {
    return gulp.src(paths.images.input)
        .pipe(plumber())
        .pipe(changed(paths.shopifyDestination, {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest(paths.shopifyAssets))
        .pipe(gulpIf(!argv.production, ("undefined" != typeof theme) ? theme.stream():'fake'))
});

// static
gulp.task('static', function() {
    gulp.src(paths.static.input)
        .pipe(plumber())
        .pipe(gulp.dest(paths.shopifyAssets))
});

// Shopify templates
gulp.task('templates', function() {
    return gulp.src(paths.shopifySource)
        .pipe(plumber())
        .pipe(changed(paths.shopifyDestination, {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest(paths.shopifyDestination))
        .pipe(gulpIf(!argv.production, ("undefined" != typeof theme) ? theme.stream():'fake'))
});

// Hellpers functions
function reload(done) {
    return done();
}

function appendLiquidExt(path) {
    if (path.extname === '.map') return;
    if (path.extname === '.css') {
        path.extname = '.scss';
    }
    path.basename += path.extname;
    path.extname = '.liquid';
}

function flatten(path) {
    if (path.dirname !== '.') {
        path.basename = path.dirname.replace('/', '_') + '_' + path.basename;
    }
}

// Watch individual css
gulp.task('watch:css', function() {
    gulp.watch(paths.css.dir, ['theme', 'css'], reload);
});

// Watch individual static
gulp.task('watch:static', function() {
    gulp.watch(paths.static.dir, ['theme', 'static'], reload);
});

// Watch individual app file and components togther
gulp.task('watch:js', function() {
    gulp.watch(paths.scripts.dir, ['theme', 'jsApp', 'jsComponents', 'jsVue'], reload);
});

// Watch individual app file
gulp.task('watch:js:app', function() {
    gulp.watch(paths.scripts.app.input, ['theme', 'jsApp'], reload);
});

// Watch individual javscript components
gulp.task('watch:js:components', function() {
    gulp.watch(paths.scripts.components.input, ['theme', 'jsComponents'], reload);
});

// Watch individual vue components
gulp.task('watch:js:vue', function() {
    gulp.watch(paths.scripts.vue.input, ['theme', 'jsVue'], reload);
});

// Watch individual fonts
gulp.task('watch:fonts', function() {
    gulp.watch(paths.fonts.input, ['theme', 'fonts'], reload);
});

// Watch individual images
gulp.task('watch:images', function() {
    gulp.watch(paths.images.input, ['theme', 'images'], reload);
})

// Watch individual templates
gulp.task('watch:templates', function() {
    gulp.watch(paths.shopifySource, ['theme', 'templates'], reload);
})

// Deploy eveything to shopify development theme
gulp.task('default', ['theme', 'css', 'jsApp', 'jsComponents', 'jsVue', 'fonts', 'images', 'templates', 'static']);

// Watch all the files but would not deploy on shopify
gulp.task('watch', ['watch:css', 'watch:js:components', 'watch:js:app','watch:js:vue', 'watch:fonts', 'watch:images', 'watch:templates', 'watch:static']);

// Watch and deploy on shopify development theme
gulp.task('dev', ['theme', 'watch']);

// Run on buddy.works
gulp.task('deploy', ['css', 'jsApp', 'jsComponents', 'jsVue', 'fonts', 'images', 'templates', 'static']);

// Clean the dist folder
gulp.task('clean', function() {
    return del(paths.shopifyDestination);
});

// Debug postcss plugin's timing
gulp.task('css:debug', ['css'], function() {
    debug.inspect()
})
