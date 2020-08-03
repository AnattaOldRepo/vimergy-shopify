import axios from 'axios'
const API = process.env.API

const client = axios.create({
  baseURL: API,
})

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    let text = txt.replace('_', ' ')
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
  })
}

const request = function(options) {
  const onSuccess = function(response) {
    console.debug('Request Successful!', response)
    return response.data
  }

  const onError = function(error) {
    console.error('Request Failed:', error.config)

    let errorObject = {}

    if (error.response) {
      // Request was made but server responded with something
      // other than 2xx
      const errorResponse = error.response
      const errorStatus = errorResponse.status
      const errorData = errorResponse.data
      const errorHeaders = errorResponse.headers

      console.error('Status:', errorStatus)
      console.error('Data:', errorData)
      console.error('Headers:', errorHeaders)

      errorObject.status = errorStatus
      errorObject.data = errorData
      errorObject.headers = errorHeaders

      if (errorStatus === 504) {
        errorObject.message = 'The request timed out. Please reload the page and try again.'

      } else if (errorData.error) {

        errorObject.message = errorData.error

        if (errorData.error.message) {
          let message = errorData.error.message.replace('The zip code you supplied failed validation.', 'The billing zip code you supplied failed validation with your active payment method.')

          errorObject.message = message


        } else if (errorData.error.errors) {

          let groupErrorMessageString = ''
          Object.keys(errorData.error.errors).forEach((groupsKey) => {
            let groups = errorData.error.errors[groupsKey]

            if (Array.isArray(groups)) {
              groups.forEach((group) => {
                groupErrorMessageString += `${group.message}. <br>`
              })
            } else {
              Object.keys(groups).forEach((groupKey) => {
                let group = groups[groupKey]

                if (Array.isArray(group)) {
                  group.forEach((groupItem) => {
                    groupErrorMessageString += `${toTitleCase(
                      groupsKey
                    )}: ${toTitleCase(groupKey)} ${groupItem.message}. <br>`
                  })
                } else {
                  Object.keys(group).forEach((groupItemKey) => {
                    let groupItem = group[groupItemKey]
                    groupErrorMessageString += `${toTitleCase(
                      groupsKey
                    )}: ${toTitleCase(groupKey)} ${groupItem.message}. <br>`
                  })
                }
              })
            }
          })

          errorObject.message = groupErrorMessageString || errorData.errors
        }
      } else if (errorData.errors) {
        errorObject.message = errorData.errors
      }
    } else {
      // Something else happened while setting up the request
      // triggered the error
      console.error('Error Message:', error.message)

      errorObject.message = error.message
    }

    return Promise.reject(errorObject)
  }

  return client(options)
    .then(onSuccess)
    .catch(onError)
}

export default request
