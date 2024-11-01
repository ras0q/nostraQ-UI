import { http } from 'msw'
import { responseUnsupported } from '../../../../utils'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/oauth2/authorize/decide'

const postResolver = () => responseUnsupported()

const handlers = [http.post(path, postResolver)]

export default handlers
