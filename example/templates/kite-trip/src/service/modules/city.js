import kiteRequest from '../request'

export function getCityAll() {
  return kiteRequest.get({
    url: "/city/all"
  })
}