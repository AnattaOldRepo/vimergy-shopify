export const buildNewCheckoutUpdatePayload = function (action, payload, storeName, actionName, successMessage) {
  // console.log(action, payload, storeName, actionName, successMessage)

  if (!action || !payload || !storeName || !actionName || !successMessage) {
    console.log('!action || !payload || !storeName || !action || !successMessage')
    return
  }

  return {
    updateAction: action,
    updateActionPayload: payload,
    updateActionStoreName: storeName,
    updateActionName: actionName,
    successMessage: successMessage,
  }
}
