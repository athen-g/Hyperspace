import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js'

export async function parseEdgeFunctionError(error: any): Promise<string> {
  if (!error) return 'Unknown error occurred.'

  if (error instanceof FunctionsHttpError) {
    try {
      const response = error.context as Response
      const body = await response.json()
      if (body) {
        if (body.message && body.code) {
          return `Error (${body.code}): ${body.message}`
        }
        if (body.message) return body.message
        if (body.error) return typeof body.error === 'string' ? body.error : JSON.stringify(body.error)
        if (body.code) return `Error Code: ${body.code}`
        return JSON.stringify(body)
      }
    } catch {
      try {
        const response = error.context as Response
        const text = await response.text()
        if (text) return text
      } catch {
        // fallback
      }
    }
  }

  if (error instanceof FunctionsRelayError) {
    return `Relay Error: ${error.message}`
  }

  if (error instanceof FunctionsFetchError) {
    return `Network Error: ${error.message}`
  }

  return error.message || String(error)
}
