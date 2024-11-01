import { HttpResponse, http } from 'msw'
import { BASE_PATH } from '/@/lib/apis'

const path = BASE_PATH + '/bots/ws'

const getResolver = () => HttpResponse.json(undefined, { status: 101 })

const handlers = [http.get(path, getResolver)]

export default handlers
