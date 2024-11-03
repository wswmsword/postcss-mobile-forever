import { onMounted, onUnmounted, ref } from 'vue'
import { throttle } from 'underscore';

// export default function useScroll(reachBottomCB) {
//   // 监听window窗口的滚动
//   // 总共可滚动区域 scrollHeight
//   // document.documentElement.scrollTop 已经滚动的高度
//   // clientHeight 客户端对应的高度
//   const scrollListenerHandler = () => {
//     const clientHeight = document.documentElement.clientHeight
//     const scrollTop = document.documentElement.scrollTop
//     const scrollHeight = document.documentElement.scrollHeight
//     console.log("------", clientHeight, scrollTop, scrollHeight)
//     if (clientHeight + Math.ceil(scrollTop) === scrollHeight) {
//       console.log("滚动到底部了")
//       if (reachBottomCB) reachBottomCB()
//     }
//   }
  
//   onMounted(() => {
//     window.addEventListener("scroll", scrollListenerHandler)
//   })
  
//   onUnmounted(() => {
//     window.removeEventListener("scroll", scrollListenerHandler)
//   })
  
// }

export default function useScroll(elRef) {
  let el = window

  const isReachBottom = ref(false)
  const clientHeight = ref(0)
  const scrollTop = ref(0)
  const scrollHeight = ref(0)

  // 防抖debounce(多次延迟执行)/节流throttle(规定时间内只执行一次)
  const scrollListenerHandler = throttle(() => {
    if (el === window) {
      clientHeight.value = document.documentElement.clientHeight
      scrollTop.value = document.documentElement.scrollTop
      scrollHeight.value = document.documentElement.scrollHeight
    } else {
      clientHeight.value = el.clientHeight
      scrollTop.value = el.scrollTop
      scrollHeight.value = el.scrollHeight
    }
    
    if (clientHeight.value + scrollTop.value + 1 >= scrollHeight.value) {
      console.log("滚动到底部了")
      isReachBottom.value = true
    }
  }, 100)
  
  onMounted(() => {
    if (elRef) el = elRef.value
    el.addEventListener("scroll", scrollListenerHandler)
  })
  
  onUnmounted(() => {
    el.removeEventListener("scroll", scrollListenerHandler)
  })
  
  return { isReachBottom, clientHeight, scrollTop, scrollHeight}
}