// https://developers.cloudflare.com/pages/functions/middleware/

/// <reference types="@cloudflare/workers-types" />

import { DEV_SERVER_PROXY_HOST } from '../dev.config'

const devServerProxyHost = new URL(DEV_SERVER_PROXY_HOST).host

export const onRequest: PagesFunction<unknown> = async context => {
  const url = new URL(context.request.url)
  if (url.pathname.startsWith('/api/v3')) {
    url.host = devServerProxyHost

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
