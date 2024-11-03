import axios from 'axios'
import useMainStore from '@/stores/modules/main'
import { BASE_URL, TIMEOUT } from './config'

const mainStore = useMainStore()

class KITERequest {
  constructor(baseURL, timeout=10000) {
    this.instance = axios.create({
      baseURL,
      timeout
    })

    this.instance.interceptors.request.use(config => {
      mainStore.isLoading = true
      return config
    }, error => {
      return error
    })
    this.instance.interceptors.response.use(res => {
      mainStore.isLoading = false
      return res
    }, err => {
      mainStore.isLoading = false
      return err
    })
  }

  request(config) {
    return new Promise((resolve, reject) => {
      this.instance.request(config).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }

  get(config) {
    return this.request({ ...config, method: "get"})
  }

  post(config) {
    return this.request({ ...config, method: "post"})
  }
}

export default new KITERequest(BASE_URL, TIMEOUT)