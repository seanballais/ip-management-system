import {
    ACCESS_TOKEN_STORAGE_NAME,
    REFRESH_TOKEN_STORAGE_NAME
} from "./tokens.ts";

const API_BASE_URL: string = 'http://localhost:8083';
const MAX_NUM_ITEMS_PER_PAGE: number = 25;

enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

interface GenericBodyData {
    [key: string]: any;
}

interface QueryParameters {
    [key: string]: any;
}

interface User {
    id: number;
    username: string;
    is_superuser: boolean
}

interface IP {
    id: number;
    ip_address: string;
    created_on: number;
    label: string;
    comment: string;
    recorder: User;
}

interface UserEvent {
    id: number;
    recorded_on: number;
    type: string;
    user: User;
}

interface IPEvent {
    id: number;
    recorded_on: number;
    type: string;
    ip: IP;
    trigger_user: User;
    old_data: IPEventData;
    new_data: IPEventData;
}

interface IPEventData {
    ip_address?: string;
    label?: string;
    comment?: string;
}

interface IPAddressData {
    count: number;
    num_total_items: number;
    page_number: number;
    ips: Array<IP>;
}

interface UserAuditLog {
    count: number;
    num_total_items: number;
    page_number: number;
    events: Array<UserEvent>
}

interface IPAuditLog {
    count: number;
    num_total_items: number;
    page_number: number;
    events: Array<IPEvent>;
}

interface IPAddressDataJSONResponse {
    data: IPAddressData;
}

interface UserAuditLogJSONResponse {
    data: UserAuditLog
}

interface IPAuditLogJSONResponse {
    data: IPAuditLog;
}

interface APIError {
    code: string;
}

interface FailedJSONResponse {
    detail: {
        errors: Array<APIError>
    }
}

interface TokenRefreshSuccessJSONResponse {
    data: {
        access_token: string,
        refresh_token: string
    };
}

async function fetchIPAddressData(numItemsPerPage: number, pageNumber: number): Promise<Response> {
    const queryParams: QueryParameters = {
        items_per_page: numItemsPerPage,
        page_number: pageNumber
    };
    try {
        return await postWithTokenRefresh('/ips-data', {}, queryParams);
    } catch (e: unknown) {
        throw e as Error;
    }
}

async function fetchUserAuditLogData(numItemsPerPage: number, pageNumber: number): Promise<Response> {
    const queryParams: QueryParameters = {
        items_per_page: numItemsPerPage,
        page_number: pageNumber
    };
    try {
        return await postWithTokenRefresh('/audit-log/users', {}, queryParams);
    } catch (e: unknown) {
        throw e as Error;
    }
}

async function fetchIPAuditLogData(numItemsPerPage: number, pageNumber: number): Promise<Response> {
    const queryParams: QueryParameters = {
        items_per_page: numItemsPerPage,
        page_number: pageNumber
    };
    try {
        return await postWithTokenRefresh('/audit-log/ips', {}, queryParams);
    } catch (e: unknown) {
        throw e as Error;
    }
}

async function postWithTokenRefresh(path: string, body: GenericBodyData, queryParams: QueryParameters | null = null): Promise<Response> {
    const response: Response = await postWithAccessToken(path, body, queryParams);
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
            // The tokens are likely to no longer be valid.
            throw error as Error;
        }
    } else {
        // Error is something else. Just return the response.
        return origResponse;
    }

    // Retry the original operation.
    return postWithAccessToken(path, body, queryParams);
}

async function refreshTokens(): Promise<void> {
    const refreshToken: string = localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME) ?? '';

    const bodyData: GenericBodyData = {
        refresh_token: refreshToken
    };
    const response: Response = await post('/token/refresh', bodyData);
    if (response.ok) {
        const {data}: TokenRefreshSuccessJSONResponse = await response.json();
        localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, data.refresh_token);

        return Promise.resolve();
    } else {
        throw new Error('Failed to refresh tokens.');
    }
}

async function postWithAccessToken(path: string, body: GenericBodyData, queryParams: QueryParameters | null = null): Promise<Response> {
    const accessToken: string = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME) ?? '';
    const bodyData: GenericBodyData = {
        ...body,
        access_token: accessToken
    };
    return post(path, bodyData, queryParams);
}

async function get(path: string, queryParams: QueryParameters | null = null): Promise<Response> {
    return fetchAPI(path, HTTPMethod.GET, null, queryParams);
}

async function post(path: string, body: GenericBodyData, queryParams: QueryParameters | null = null): Promise<Response> {
    return fetchAPI(path, HTTPMethod.POST, JSON.stringify(body), queryParams);
}

async function put(path: string, body: string, queryParams: QueryParameters | null = null): Promise<Response> {
    return fetchAPI(path, HTTPMethod.PUT, body, queryParams);
}

async function fetchAPI(path: string, method: HTTPMethod, body: string | null, queryParams: QueryParameters | null = null): Promise<Response> {
    let url: string = `${API_BASE_URL}${path}`;
    if (queryParams !== null) {
        const params: URLSearchParams = new URLSearchParams(queryParams);
        url += `?${params.toString()}`;
    }

    return fetch(url, {
        method: method,
        headers: {
            'content-type': 'application/json;charset=UTF-8'
        },
        body: body
    });
}

export {
    HTTPMethod,
    MAX_NUM_ITEMS_PER_PAGE,
    fetchIPAddressData,
    fetchIPAuditLogData,
    fetchUserAuditLogData,
    postWithTokenRefresh,
    post,
    put
};
export type {
    APIError,
    FailedJSONResponse,
    GenericBodyData,
    IP,
    IPAddressData,
    IPAddressDataJSONResponse,
    IPAuditLog,
    IPAuditLogJSONResponse,
    IPEvent,
    QueryParameters,
    User,
    UserAuditLog,
    UserAuditLogJSONResponse,
    UserEvent
};

