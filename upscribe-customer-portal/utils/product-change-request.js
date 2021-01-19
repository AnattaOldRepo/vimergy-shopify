// check if product in passed product list
function checkVariantInProductList(variantId, items, id) {
  let matchingProduct = false

  if (id) {
    items.forEach((item) => {
      if (item.id === id) {
        matchingProduct = item
      }
    })
  }

  items.forEach((item) => {
    if (item.variant_id === variantId) {
      matchingProduct = item
    }
  })

  return matchingProduct || false
}

// returns request payload options for givin variantId, subscription, and whether the update
// is being made on a subscription or next order
/**
 *
 * @param { variantId } Number - products variant id
 * @param { editNextOrder } Boolean - whether we're getting payloads for the subscription.next update or main subscription update
 * @param { subscriptoin } Object - full subscription object
 */
const productChangeRequest = function({
  variantId,
  editNextOrder,
  subscription,
  quantity,
  id,
}) {
  if ((!variantId || !subscription) && !quantity && !id) {
    return
  }

  // which list to compare to - determined by if we're making a request payload for the
  // main subscription products or the next order products

  const productList = editNextOrder
    ? subscription.next.items
    : subscription.items

  let setQuantityPayload = {}
  let increasePayload = {}
  let decreasePayload = {}
  let removePayload = {}
  let addPayload = {}

  // returns false or the product in the list
  const productInList = checkVariantInProductList(variantId, productList, id)

  // chanage
  if (productInList) {
    let productQuantity = productInList.quantity
    let itemId = productInList.id
    let productId = productInList.product_id

    setQuantityPayload = {
      id: itemId,
      product_id: productId,
      quantity,
    }

    // add one to existing quantity
    increasePayload = {
      id: itemId,
      product_id: productId,
      quantity: productQuantity + 1,
    }

    // decrease will be the same as remove if last item
    if (productQuantity === 1) {
      decreasePayload = {
        id: itemId,
        product_id: productId,
        delete: 1,
      }
    } else {
      decreasePayload = {
        id: itemId,
        product_id: productId,
        quantity: productQuantity - 1,
      }
    }

    // remove always looks like this
    removePayload = {
      id: itemId,
      product_id: productId,
      delete: 1,
      variantId,
    }

    // if product already in list, then an add is just a quantity increase
    addPayload = {
      id: itemId,
      product_id: productId,
      quantity: productQuantity + 1,
    }
  }

  // if item not in list
  else {
    setQuantityPayload = {
      variant_id: variantId,
      quantity,
    }

    // increase for an item that's not already there
    // is the same as adding it the first time
    increasePayload = {
      variant_id: variantId,
      quantity: 1,
    }

    // item not in list - so can't decrease it
    // don't do an update here
    decreasePayload = false

    // item not in list - so can't remove it
    // don't do an update here
    removePayload = false

    // regular add product, since it wasn't in the list
    addPayload = {
      variant_id: variantId,
      quantity: 1,
    }
  }

  return {
    setQuantityPayload,
    increasePayload,
    decreasePayload,
    removePayload,
    addPayload,
  }
}

export default productChangeRequest
