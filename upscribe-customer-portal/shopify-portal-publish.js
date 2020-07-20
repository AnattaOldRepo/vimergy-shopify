const cpy = require('cpy')
const del = require('del')
const fs = require('fs')
const cheerio = require('cheerio')

const pageAccountTemplate = '../templates/page.account-subscriptions.liquid'
const customerAccountTemplate =
  '../templates/customers/account.subscriptions.liquid'

const globalVariablesScript = `<script>window.upscribeStoreDomain = '{{ shop.permanent_domain }}';window.upscribeCustomerId = '{{ customer.id }}';</script> `

// Delete old nuxt script bundles and old subscription account template
del.sync(['../assets/upscribe_*'], {
  force: true,
})

// Copy all built nuxt bundles to Shopify
cpy('./dist/_nuxt/upscribe_*', '../assets')
cpy('./dist/_nuxt/upscribe_fonts/*', '../assets')

/**
 * Create altered account.subscriptions.liquid template
 * 1. Customer global variables at top
 * 2. Nuxt html
 * 3. Liquid script loading
 */

fs.readFile('./dist/index.html', 'utf8', function(err, data) {
  if (err) throw err
  const html = data.toString()
  const $ = cheerio.load(html)
  const scripts = $('script').get()
  const links = $('link').get()
  const nuxtAppHtml = $.html($('#__nuxt'))
  let scriptFileNames = []
  let styleFileNames = []

  scripts.forEach((script) => {
    if (!script.attribs.src) return

    if (script.attribs.src.includes('/_nuxt/')) {
      scriptFileNames.push(script.attribs.src.split('/_nuxt/')[1])
    } else {
      scriptFileNames.push(script.attribs.src)
    }
  })

  links.forEach((link) => {
    const stylesheet = link.attribs.rel === 'stylesheet'
    // const script = link.attribs.as === 'script'

    if (stylesheet) {
      if (link.attribs.href.includes('/_nuxt/')) {
        styleFileNames.push(link.attribs.href.split('/_nuxt/')[1])
      } else {
        styleFileNames.push(link.attribs.href)
      }
    }
  })

  console.log({
    scriptFileNames,
    styleFileNames,
  })

  let liquidStylesheetIncludes = styleFileNames.reduce((result, fileName) => {
    result += `{{ '${fileName}' | asset_url | stylesheet_tag }}`
    return result
  }, '')

  // add liquid script asset loader string
  let liquidScriptIncludes = scriptFileNames.reduce((result, fileName) => {
    result += `{{ '${fileName}' | asset_url | script_tag }}`
    return result
  }, '')

  const finalPageHtml =
    globalVariablesScript +
    liquidStylesheetIncludes +
    nuxtAppHtml +
    liquidScriptIncludes

  fs.writeFile(pageAccountTemplate, finalPageHtml, function(err) {
    if (err) throw err
    console.log(`${pageAccountTemplate} created successfully!`)
  })
  fs.writeFile(customerAccountTemplate, finalPageHtml, function(err) {
    if (err) throw err
    console.log(`${customerAccountTemplate} created successfully!`)
  })
})
