const API_BASE_URL: string = 'http://localhost:8083';

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

async function post(path: string, body: string): Promise<Response> {
    return fetchAPI(path, HTTPMethod.POST, body);
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

export {HTTPMethod, post};
export type {User, APIError};

