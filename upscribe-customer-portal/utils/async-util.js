import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://fxpflqhs52.execute-api.us-east-1.amazonaws.com/stage',
})

const doAsync = (
  store,
  { url, mutationTypes, info = false, method = 'get' }
) => {
  store.commit(mutationTypes.PENDING)

  instance(url, {
    method: method,
  })
    .then((response) => {
      store.commit(mutationTypes.SUCCESS, {
        data: response.data,
        info,
      })
    })
    .catch((error) => {
      console.error('error: ', error)
      store.commit(mutationTypes.FAILURE, error)
    })
}

export default doAsync
