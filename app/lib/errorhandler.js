/**
 * Standard error response handler for loaders and actions
 */
export function handleLoaderError(error, context = '') {
    console.error(`Error in ${context}:`, error);

    if (error?.response?.status === 404) {
        throw new Response('Not Found', { status: 404 });
    }

    if (error?.response?.status === 401) {
        throw new Response('Unauthorized', { status: 401 });
    }

    throw new Response('Internal Server Error', { status: 500 });
}

/**
 * Safely execute async operations with error logging
 */
export async function safeExecute(fn, fallback = null, context = '') {
    try {
        return await fn();
    } catch (error) {
        console.error(`Error in ${context}:`, error);
        return fallback;
    }
}

/**
 * Handle Customer Account API mutations with consistent error handling
 */
export async function handleCustomerMutation(
    customerAccount,
    mutation,
    variables,
) {
    try {
        const { data, errors } = await customerAccount.mutate(mutation, { variables });

        if (errors?.length) {
            throw new Error(errors.map((e) => e.message).join(', '));
        }

        return { success: true, data };
    } catch (error) {
        console.error('Customer mutation error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred',
        };
    }
}