/**
 * Error handling helpers (shared with web)
 */

export function handleSupabaseError(operation: string, error: any): never {
  const errorMessage = error?.message || 'Unknown error occurred'
  const errorCode = error?.code || 'UNKNOWN'
  const errorDetails = error?.details || ''

  console.error(`[Supabase Error] ${operation}:`, {
    message: errorMessage,
    code: errorCode,
    details: errorDetails,
    fullError: error,
  })

  throw new Error(`${operation} failed: ${errorMessage}`)
}

export async function safeSupabaseCall<T>(
  promise: Promise<{ data: T | null; error: any }>,
  operation: string
): Promise<T> {
  const { data, error } = await promise

  if (error) {
    handleSupabaseError(operation, error)
  }

  if (data === null) {
    throw new Error(`${operation} returned null data`)
  }

  return data
}


