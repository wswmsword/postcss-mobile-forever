import { defineStore } from "pinia";

const startDate = new Date()
const endDate = new Date()
endDate.setDate(startDate.getDate() + 1)

const useMainStore = defineStore("main", {
  state: () => ({
    token: "",

    startDate: startDate,
    endDate: endDate,

    isLoading: false
  })
})

export default useMainStore
