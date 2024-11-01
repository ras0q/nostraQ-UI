import { http } from 'msw'

const path = '${baseURL}/oauth2/authorize/decide'

const postResolver = () => responseUnsupported()

const handlers = [http.post(path, postResolver)]

export default handlers
