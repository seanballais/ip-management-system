const API_BASE_URL: string = 'http://localhost:8083';
const ACCESS_TOKEN_STORAGE_NAME: string = 'accessToken';
const REFRESH_TOKEN_STORAGE_NAME: string = 'refreshToken';

enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

interface User {
    id: number;
    username: string;
    is_superuser: boolean
}

interface APIError {
    code: string;
}

interface FailedJSONResponse {
    detail: {
        errors: Array<APIError>
    }
}

interface TokenRefreshBodyData {
    refresh_token: string;
}

interface TokenRefreshSuccessJSONResponse {
    data: {
        access_token: string,
        refresh_token: string
    };
}

async function getWithTokenRefresh(path: string, body: string): Promise<Response> {
    const response: Response = await get(path, body);
    if (response.ok) {
        return response;
    }

    // Check first if the error is about an invalid access token.
    const origResponse: Response = response.clone();
    const {detail}: FailedJSONResponse = await response.json();
    if (detail.errors[0].code === 'invalid_access_token') {
        // Refresh tokens.
        try {
            await refreshTokens();
        } catch (error: unknown) {
            throw error as Error;
        }
    } else {
        // Error is something else. Just return the response.
        return origResponse;
    }

    // Retry the original operation.
    return get(path, body);
}

async function refreshTokens(): Promise<void> {
    const refreshToken: string = localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME) ?? '';

    const bodyData: TokenRefreshBodyData = {
        refresh_token: refreshToken
    };
    const response: Response = await get('token/refresh', JSON.stringify(bodyData));
    if (response.ok) {
        const {data}: TokenRefreshSuccessJSONResponse = await response.json();
        localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, data.refresh_token);

        return Promise.resolve();
    } else {
        throw new Error('Failed to refresh tokens.');
    }
}

async function get(path: string, body: string): Promise<Response> {
    return fetchAPI(path, HTTPMethod.GET, body);
}

async function post(path: string, body: string): Promise<Response> {
    return fetchAPI(path, HTTPMethod.POST, body);
}

async function put(path: string, body: string): Promise<Response> {
    return fetchAPI(path, HTTPMethod.PUT, body);
}

async function fetchAPI(path: string, method: HTTPMethod, body: string): Promise<Response> {
    return fetch(`${API_BASE_URL}${path}`, {
        method: method,
        headers: {
            'content-type': 'application/json;charset=UTF-8'
        },
        body: body
    });
}

export {
    ACCESS_TOKEN_STORAGE_NAME,
    REFRESH_TOKEN_STORAGE_NAME,
    HTTPMethod,
    getWithTokenRefresh,
    post,
    put
};
export type {User, APIError};

