import { reactive } from '@vue/composition-api'
import api from '@/lib/api'

const useLogin = () => {
  const state = reactive({
    name: '',
    pass: '',
    error: undefined as string | undefined
  })
  const setName = (name: string) => {
    state.error = undefined
    state.name = name
  }
  const setPass = (pass: string) => {
    state.error = undefined
    state.pass = pass
  }
  const login = async () => {
    try {
      await api.login('/', { name: state.name, password: state.pass })
      location.href = '/'
    } catch (e) {
      // TODO 修正
      const message = e.response.data.message as string
      const status = e.response.status as number
      switch (message) {
        case 'name: cannot be blank; password: cannot be blank.':
          state.error = 'IDとパスワードを入力してください'
          break
        case 'password: cannot be blank.':
          state.error = 'パスワードを入力してください'
          break
        case 'name: cannot be blank.':
          state.error = 'IDを入力してください'
          break
        case 'invalid name':
          state.error = `"${state.name}" は存在しないユーザーIDです`
          break
        case 'password or id is wrong':
          state.error = 'IDまたはパスワードが誤っています'
          break
        default:
          state.error = `${status}: ${message}`
      }
    }
  }
  const loginExternal = async (provider: string) => {
    location.href = `/api/auth/${provider}`
  }
  return {
    loginState: state,
    login,
    loginExternal,
    setName,
    setPass
  }
}

export default useLogin
