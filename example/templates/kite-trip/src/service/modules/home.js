import kiteRequest from '../request'

export function getHotSuggests() {
  return kiteRequest.get({
    url: "/home/hotSuggests"
  })
}

export function getCategories() {
  return kiteRequest.get({
    url: "/home/categories"
  })
}

export function getHouseList(currentPage) {
  return kiteRequest.get({
    url: "/home/houseList",
    params: {
      page: currentPage
    }
  })
}