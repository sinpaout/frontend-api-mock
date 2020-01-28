import axios from 'axios'
const client = axios.create();

client.interceptors.request.use(function(config) {
  return new Promise((resolve) => {
    // 開発環境かつapiMockerが存在する時のみモックを適用
    if (process.env.NODE_ENV === 'development' && global.apiMockInterceptor) {
      global.apiMockInterceptor(config)
    }

    resolve(config)
  })
},
function(error) {
  return Promise.reject(error)
})

export default client
