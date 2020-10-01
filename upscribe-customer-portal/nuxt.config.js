const pkg = require('./package.json')
const nodeExternals = require('webpack-node-externals')

const path = require('path')
const fs = require('fs')
const dotENV = require('dotenv')

process.env.APP_ENV = process.env.APP_ENV || 'production' // default to production environment.

const config = ['.env', `.${process.env.APP_ENV}.env`].reduce(
  (config, filename) => {
    const filePath = path.resolve(__dirname, filename)

    if (fs.existsSync(filePath)) {
      const { parsed } = dotENV.config({ path: filePath })

      Object.assign(config, parsed)
    }

    return config
  },
  { APP_ENV: process.env.APP_ENV }
)

console.log({ APP_ENV: config.APP_ENV, API: config.API })

module.exports = {
  mode: 'spa',

  env: config,

  router: {
    mode: 'hash',
  },

  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  loading: { color: '#fff' },

  // css: [{ src: '~assets/css/index.scss', lang: 'scss' }],

  plugins: [
    '~/plugins/globalMixins',
    { src: '~plugins/storeSegment.js', mode: 'client' },
    { src: '~plugins/storeGtm.js', mode: 'client' },
    { src: '~plugins/filter.js', mode: 'client' },
    { src: '~plugins/persistedState.js', mode: 'client' },
    { src: '~plugins/analytics.js', mode: 'client' },
    { src: '~plugins/formValidation.js', mode: 'client' },
    { src: '~plugins/vueJsToggleButton', mode: 'client' },
    { src: '~/plugins/vueContentPlaceholders.js', mode: 'client' },
  ],

  modules: ['@nuxtjs/dotenv', 'portal-vue/nuxt', 'nuxt-healthcheck'],

  healthcheck: {
    path: '/health-check',
  },

  build: {
    splitChunks: {
      layouts: false,
      pages: false,
      commons: false,
    },

    extractCSS: true,

    filenames: {
      app: ({ isDev }) => (isDev ? '[name].js' : 'upscribe_[chunkhash].js'),
      chunk: ({ isDev }) => (isDev ? '[name].js' : 'upscribe_[chunkhash].js'),
      css: ({ isDev }) => (isDev ? '[name].css' : 'upscribe_[contenthash].css'),
      img: ({ isDev }) =>
        isDev ? '[path][name].[ext]' : 'upscribe_img/[hash:7].[ext]',
      font: ({ isDev }) =>
        isDev ? '[path][name].[ext]' : 'upscribe_fonts/[name].[ext]',
      video: ({ isDev }) =>
        isDev ? '[path][name].[ext]' : 'upscribe_videos/[hash:7].[ext]',
    },

    loaders: {
      cssModules: {
        camelCase: true,
        localIdentName: '[local]_[hash:base64:5]',
      },
    },

    // extend webpack
    extend(config, ctx) {
      if (ctx.isServer) {
        config.externals = [
          nodeExternals({
            whitelist: [
              /\.(?!(?:js|json)$).{1,5}$/i,
              /^vue-google-autocomplete/,
              /^pikaday/,
            ],
          }),
        ]
      }

      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        })
      }

      config.resolve.extensions.push('.scss')

      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          ...require('./aliases.config').nuxt,
        },
      }
    },
  },
}
