import apiUser from '@/api/modules/user'
import router from '@/router'

const useUserStore = defineStore(
  // 唯一ID
  'user',
  () => {
    const account = ref(localStorage.account ?? '')
    const token = ref(localStorage.token ?? '')
    const avatar = ref(localStorage.avatar ?? '')
    const isGetPermissions = ref(false)
    const permissions = ref<string[]>([])

    const isLogin = computed(() => {
      if (token.value) {
        return true
      }
      return false
    })

    function login(data: {
      account: string
      password: string
    }) {
      return new Promise((resolve, reject) => {
        apiUser.login(data).then((res) => {
          localStorage.setItem('account', res.data.account)
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('avatar', res.data.avatar)
          account.value = res.data.account
          token.value = res.data.token
          avatar.value = res.data.avatar
          resolve(res)
        }).catch((error) => {
          reject(error)
        })
      })
    }
    function logout() {
      // 模拟退出登录，清除 token 信息
      localStorage.removeItem('account')
      localStorage.removeItem('token')
      localStorage.removeItem('avatar')
      account.value = ''
      token.value = ''
      avatar.value = ''
      router.push('/')
    }
    // 获取权限
    async function getPermissions() {
      const res = await apiUser.permission()
      permissions.value = res.data.permissions
      isGetPermissions.value = true
    }

    return {
      account,
      token,
      avatar,
      isLogin,
      isGetPermissions,
      permissions,
      login,
      logout,
      getPermissions,
    }
  },
)

export default useUserStore
