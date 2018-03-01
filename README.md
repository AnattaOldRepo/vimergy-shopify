# vimergy.com
Shopify theme development.


### Development branch
`staging`

You can create as many as feature branches you want, but merge them in `staging` to deploy on staging

### Deployment on Shopify

`master` branch is auto deploy through buddy on `Anattadesign` theme


### Frontend Development Dependencies

*	Ruby - Install globally
*	Node v6.3.1+ - Install globally
*	Gulp - Install globally

### Frontend Setup

After installing all the dependencies follow these steps:

* Go to shopify admin and create new theme from "Anattadesign"
* run `npm install` or  `yarn install` in the root of the folder
* make copy of `shopifyconfig.sample.js` and rename to `shopifyconfig.js`
* update all the information shopifyconfig is required.
* run `gulp` - It will upload all the to your shopify theme

### Frontend source directory

* source files: `src`
* build files: `dist`


### CSS Preprocessor/postprocessor


* [Postcss](http://postcss.org/)


##### Postcss plugins we are using:

Please go through the documentation of these plugins before start coding so that you can get the idea what they are useful for and you can take advantaces of their features.
http://postcss.parts/

* precss
* postcss-import
* postcss-url
* lost
* postcss-simple-vars
* postcss-short
* postcss-utilities
* postcss-zindex
* postcss-color-function
* postcss-fontpath
* postcss-easings
* postcss-reporter
* cssnext - It comes with autoprefixer

### Task Runners

* Gulp


### Gulp Main Tasks:

* `gulp` - run to compile and watch all the assets.
* `gulp dev` - run to compile once and it would not watch anything. Also it runs on deploybot for development environment.
* `gulp deploy --production` - run to compile assets in production mode. Also it runs on buddy for production environment.

### Frontend code guidelines:
https://github.com/anattadesign/AnattaDesign-frontend-development-guidelines

Happy Coding!
