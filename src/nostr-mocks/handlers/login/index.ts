import { http } from 'msw'

const path = '${baseURL}/login'

const postResolver = () => responseUnsupported()

const handlers = [http.post(path, postResolver)]

export default handlers
