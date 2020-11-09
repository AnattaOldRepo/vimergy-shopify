# Upscribe Customer Portal Default Theme

## Set Up Default Portal

1. Clone Upscribe Customer Portal into Shopify repo
2. Add Portal build scripts
3. Setup Repo
4. Understand Build System
5. Publishing Portal Code

### Clone Default Customer Portal

In your Shopify codebase clone down or download the [Upscribe Default Customer Portal](https://github.com/anattadesign/upscribe-customer-portal)

### Add Portal Build Scripts

1. Init a package.json if you don't already have one - `npm init` or `yarn init`
2. Add npm scripts for local development, portal build, and publishing your portal from your root directory

```javascript
{
    // ...
    "scripts": {
        "portal:setup": "cd upscribe-customer-portal && yarn install",
        "portal:dev": "cd upscribe-customer-portal && yarn run dev",
        "portal:build": "cd upscribe-customer-portal && yarn run build",
        "portal:publish": "cd upscribe-customer-portal && node shopify-portal-publish.js"
    },
    "dependencies": {
        "append-file": "^1.0.2",
        "cpy": "^7.3.0",
        "del": "^5.1.0",
        "prepend-file": "^1.3.1"
    }
    // ...
}
```

#### `portal:setup`

Install packages in `upscribe-customer-portal`

```
http://localhost:3000/#/?storeDomain=<your-store-domain.myshopify.com>&customerId=<customer-id>
```

#### `portal:dev`

Equivalent of `nuxt dev` , runs portal on localhost:3000

#### `portal:build`

Equivalent of `nuxt build` packages build bundles

:::warning
Must run this before `portal:publish` to have current dist files
:::

#### `portal:publish`

1. Copies Nuxt dist bundles into Shopify /assets
2. Creates templates/customer/account.subscriptions.liquid
3. Creates templates/page.account-subscriptions.liquid

```html
<!-- templates/customer/account.subscriptions.liquid -->

<script>
  window.upscribeStoreDomain = '{{ shop.permanent_domain }}'
  window.upscribeCustomerId = '{{ customer.id }}'
</script>

{{ 'upscribe_8f6cc6aa17623d5b0fe6.css' | asset_url | stylesheet_tag }} {{
'upscribe_307b3d35908b2a7a1ada.css' | asset_url | stylesheet_tag }}

<div id="upscribe-portal" data-n-head="">
  <div id="__nuxt">
    <style>
      /* ... */
    </style>

    <div id="nuxt-loading" aria-live="polite" role="status">
      <div>Loading...</div>
    </div>
  </div>
</div>

{{ 'upscribe_44dc5bc211a912e22333.js' | asset_url | script_tag }} {{
'upscribe_d9a21c4af624849c5e0c.js' | asset_url | script_tag }} {{
'upscribe_f9eb9cd2bf804c274b45.js' | asset_url | script_tag }}
```

### Publishing Customer Portal

After the build process in the Nuxt theme, the copy scripts have:

1. Removed all (now outdated) customer portal JavaScript bundles `upscribe_*` from from the shopify `assets` folder.
2. Removed the `account.subscriptions.liquid` template.

3. Copied the new customer portal JavaScript bundles to `assets`
4. Created new `account.subscriptions.liquid` and `page.account-subscriptions`that reference those bundles, have the initial Nuxt SPA container, and a script that creates global JavaScript variables for `upscribeCustomerId` and `upscribeStoreDomain` which are used to load the correct store and customer portal data when a customer logs into their Shopify account.

:::tip
`templates/page.account-subscriptions.liquid`
This template is used only for direct email actions if the customer isn't logged in.
In all other cases customers will use the portal in `/customer/account.subscriptions.liquid`
:::

#### Files from build

```
/assets
    upscribe_12345.js
    upscribe_23456.js
    upscribe_34567.js
    upscribe_47837.css
    upscribe_47837.css
    ...
/templates
    /customer
        account.subscriptions.liquid
    page.account-subscriptions.liquid
```

#### Push files to Shopify

Push these files up to your Shopify theme using whichever method you use for development, popular options being:

**[ThemeKit](https://shopify.github.io/themekit/)**

**[Slate](https://shopify.github.io/slate/docs/about)**

### Access Portal

#### Dev Mode for Portal

Ideally you use this for custom develompent on the default portal

```
http://localhost:3000/#/?storeDomain=${your-store-domain.myshopify.com}&customerId=${customer-id}>
```

#### Account Page Template

The main portal, used when a customer logs into their Shopify account and clicks the "Subscriptions" tag.

The `customerId` and `storeDomain` query params aren't needed here becuase that information is automatically loaded in from liquid tags from the shopify customer object.

```
https://${store-domain}/account?view=subscriptions#/
```

#### Alternative Account Template

In production this will only be used when sending a customer to their portal from an email with a direct action. For example with [Skip Next Shipment](/admin-settings/email-actions.html#skip-next-order-shipment) or [Add Product to Next Order](/admin-settings/email-actions.html#add-product-to-next-order) functionality.

This is because Shopify requires a customer to be logged into their account to view the account page.

```
https://${store-domain}/pages/account-subscriptions/#/?storeDomain=${your-store-domain.myshopify.com}&customerId=${customer-id}
```

## Update Colors and Fonts

Update colors in /design/_colors.scss

Update font names in /design/_typography
Update fonts rules to /assets/css/settings/fonts.scss

Upload fonts to /assets/fonts

## Releases

1. Create new release branch in upscribe-customer-portal
2. Create new theme in upscribe demo shopify store
3. Setup config.yml in upscribe-shopify-theme repo to deploy to demo store (replace the theme id with the one created in step 2)
4. Start theme watch from root of upscribe-shopify-theme
5. Build the customer portal yarn portal:build:<environment-endpoints>  (if in the main root of the upscribe-shopify-theme. OR yarn build:<environement-endpoints> (usually yarn build:stage)
6. Run yarn portal:publish from root of upscribe-shopify-theme
7. You will see the files being pushed up in your theme watch terminal that is running
8. Release is setup on theme to be able to preview/QA
