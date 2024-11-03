import kiteRequest from "../request"

export function getDetailInfos(houseId) {
  return kiteRequest.get({
    url: "/detail/infos",
    params: {
      houseId
    }
  })
}