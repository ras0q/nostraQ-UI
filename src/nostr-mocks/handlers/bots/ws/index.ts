import { HttpResponse, http } from 'msw'

const path = '${baseURL}/bots/ws'

const getResolver = () => HttpResponse.json(undefined, { status: 101 })

const handlers = [http.get(path, getResolver)]

export default handlers
