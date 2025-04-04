import {User} from "./api.ts";

enum TokenType {
    ACCESS_TOKEN = 'access_token',
    REFRESH_TOKEN = 'refresh_token'
}

const ACCESS_TOKEN_STORAGE_NAME: string = 'accessToken';
const REFRESH_TOKEN_STORAGE_NAME: string = 'refreshToken';

interface TokenPayload {
    data: User;
    exp: number;
    token_type: TokenType
}

function getUserDataFromToken(token: string): User {
    // Based on:
    // - https://medium.com/@feldjesus/how-to-decode-a-jwt-token-175305335024
    const tokenParts: Array<string> = token.split('.');
    const payload: TokenPayload = JSON.parse(atob(tokenParts[1]));
    return payload.data;
}

function clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_NAME);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_NAME);
}

export {
    ACCESS_TOKEN_STORAGE_NAME,
    REFRESH_TOKEN_STORAGE_NAME,
    clearTokens,
    getUserDataFromToken
};
