/* eslint-disable */
export default ({ app, store }, inject) => {
  inject('loadStoreGtm', (GtmId) => {
    if (
      !store ||
      !store.state ||
      !store.state.shop ||
      !store.state.shop.google_tag_manager_id
    ) {
      console.log('google_tag_manager_id not available')
      return
    }

    const { google_tag_manager_id } = store.state.shop
    ;(function(w, d, s, l, i) {
      w[l] = w[l] || []
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : ''
      j.async = true
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
      f.parentNode.insertBefore(j, f)
    })(window, document, 'script', 'dataLayer', google_tag_manager_id)
  })

  inject('loadStoreGtmTransactionSuccess', (orderData) => {
    // console.log('loadStoreGtmTransactionSuccess order: ', orderData)
    const order = orderData.shopify_order

    if (
      !store ||
      !store.state ||
      !store.state.shop ||
      !store.state.shop.google_tag_manager_id ||
      !order
    ) {
      console.log('google_tag_manager_id or order not available')
      return
    }

    window.addEventListener('load', function() {
      window.dataLayer = window.dataLayer || []

      const { customer } = order
      if (customer) {
        window.dataLayer.push({
          visitorType: 'Logged In',
          visitorId: customer.id,
          CustomerId: customer.id,
          CustomerEmail: customer.email,
          CustomerFirstName: customer.first_name,
          CustomerLastName: customer.last_name,
          CustomerOrdersCount: customer.orders_count,
          CustomerTotalSpent: customer.total_spent,
        })
      } else {
        window.dataLayer.push({ visitorType: 'Guest' })
      }

      window.dataLayer.push({
        pageType: 'purchase',
        event: 'transactionComplete',
        ecommerce: {
          currencyCode: order.currency,
          purchase: {
            actionField: {
              id: order.order_number,
              revenue: order.total_price,
              tax: order.tax_price,
              shipping:
                order.shipping_lines && order.shipping_lines[0]
                  ? order.shipping_lines[0].price
                  : '',
              // 'affiliation': '{{ shop.name }}',
              coupon:
                order.discount_codes && order.discount_codes[0]
                  ? order.discount_codes.code
                  : '',
              couponAmount:
                order.discount_codes && order.discount_codes[0]
                  ? order.discount_codes.amount
                  : 0,
              products: order.line_items.map((line_item) => {
                let frequency = ''
                if (
                  line_item.properties &&
                  line_item.properties['Subscription'] &&
                  line_item.properties['Subscription'].split(' ')[0]
                ) {
                  frequency = line_item.properties['Subscription'].split(' ')[0]
                }

                return {
                  name: line_item.title,
                  frequency: frequency,
                  id: line_item.sku,
                  productId: line_item.id,
                  price: line_item.price,
                  brand: line_item.vendor,
                  category: line_item.product_type,
                  variant: line_item.variant_title,
                  quantity: line_item.quantity,
                }
              }),
            },
          },
        },
      })
    })

    if (
      !store ||
      !store.state ||
      !store.state.shop ||
      !store.state.shop.google_tag_manager_id
    ) {
      console.log('google_tag_manager_id not available')
      return
    }

    const { google_tag_manager_id } = store.state.shop
    ;(function(w, d, s, l, i) {
      w[l] = w[l] || []
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : ''
      j.async = true
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
      f.parentNode.insertBefore(j, f)
    })(window, document, 'script', 'dataLayer', google_tag_manager_id)
  })
}
