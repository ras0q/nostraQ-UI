import { http } from 'msw'
import { responseUnsupported } from '../../utils'

const path = '${baseURL}/login'

const postResolver = () => responseUnsupported()

const handlers = [http.post(path, postResolver)]

export default handlers
