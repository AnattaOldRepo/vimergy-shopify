/* eslint-disable eqeqeq */
export default function(
  updatePayload,
  activeSubscription,
  products,
  productImages
) {
  // console.log('products', products)
  // console.log('activeSubscription', activeSubscription)
  const activeSubscriptionItems = activeSubscription.items

  const itemsUpdate = updatePayload.requestPayload.items.filter(
    (item) => !item.delete
  )
  const deleteItems = updatePayload.requestPayload.items.filter(
    (item) => item.delete
  )

  // console.log('itemsUpdate', itemsUpdate)

  const finalItems = [...activeSubscriptionItems]

  // handle updates to quantity for new updates
  itemsUpdate.forEach((updateItem) => {
    let alreadyInSubscriptionIndex = false
    finalItems.forEach((existingItem, index) => {
      if (
        updateItem.id === existingItem.id ||
        updateItem.variant_id === existingItem.variant_id
      ) {
        alreadyInSubscriptionIndex = index
      }
    })

    // console.log('alreadyInSubscriptionIndex', alreadyInSubscriptionIndex)

    let variantMatch = {}

    // get the full product based on id/variant_id passed
    let fullItem = products.filter((product) => {
      // console.log('product.variant_id', product.variant_id)

      let variantIdMatch = false
      // updateItem.variant_id == product.variant_id

      product.variants.forEach((variant) => {
        if (variant.id === updateItem.variant_id) {
          // console.log('this is the product', product)
          // console.log('this is the variant', variant)

          let variantImage = product.images.filter(
            (image) => image.id === variant.image_id
          )[0]

          variantIdMatch = true
          variantMatch = {
            variant,
            image: variantImage || product.image,
            title: product.title,
            quantity: updateItem.quantity || 1,
            variant_title: variant.title,
          }
        }
      })

      return updateItem.id == product.id || variantIdMatch
    })[0]

    // console.log('variantMatch', variantMatch)

    // console.log('fullItem', fullItem)

    let activeSubscriptionItemMerge = activeSubscriptionItems.filter(
      (aSubItem) => {
        return (
          updateItem.id === aSubItem.id ||
          updateItem.variant_id === aSubItem.variant_id
        )
      }
    )[0]

    // console.log('activeSubscriptionItemMerge', activeSubscriptionItemMerge)

    // return full item with updates
    const finalItem = {
      ...fullItem,
      ...activeSubscriptionItemMerge,
      ...variantMatch,
      quantity: updateItem.quantity ? updateItem.quantity : 1,
    }
    // console.log('final Update Item', finalItem)

    // update existing if already in items - ie quantity
    if (alreadyInSubscriptionIndex !== false) {
      finalItems.splice(alreadyInSubscriptionIndex, 1, finalItem)
    }

    // new item
    else {
      finalItems.push(finalItem)
    }
  })

  // console.log('finalItems after updates', finalItems)

  // remove any delete items
  let deleteIndexes = []
  deleteItems.forEach((deleteItem) => {
    activeSubscriptionItems.forEach((existingItem, index) => {
      if (existingItem.id === deleteItem.id) {
        deleteIndexes.push(index)
      }
    })
  })

  // console.log('delete indexes', deleteIndexes)

  // handle removing items
  for (let i = deleteIndexes.length - 1; i >= 0; i--) {
    finalItems.splice(deleteIndexes[i], 1)
  }

  // console.log('finalItems', finalItems)
  return finalItems
}
