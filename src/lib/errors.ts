/**
 * Error handling helpers for Supabase operations
 */

/**
 * Handles Supabase errors by logging formatted error information and throwing a new Error
 * @param operation - Description of the operation that failed
 * @param error - The error object from Supabase
 * @throws Error with a formatted message
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

/**
 * Safely executes a Supabase call and handles errors
 * @param promise - The Supabase promise that returns { data, error }
 * @param operation - Description of the operation for error messages
 * @returns Promise that resolves to the data (non-null)
 * @throws Error if there's an error or data is null
 */
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


