// https://developers.cloudflare.com/pages/functions/middleware/

/// <reference types="@cloudflare/workers-types" />

import { DEV_SERVER_PROXY_HOST } from '../dev.config'

export const onRequest: PagesFunction<unknown> = async context => {
  const url = new URL(context.request.url)
  if (url.pathname.startsWith('/api/v3')) {
    url.host = DEV_SERVER_PROXY_HOST

    const response = await fetch(new Request(url), {
      headers: context.request.headers
    })

    return new Response(await response.text(), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  }

  return await context.next()
}
