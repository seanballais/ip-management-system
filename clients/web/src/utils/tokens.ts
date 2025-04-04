import UserData from "../interfaces/UserData.ts";

enum TokenType {
    ACCESS_TOKEN = 'access_token',
    REFRESH_TOKEN = 'refresh_token'
}

interface TokenPayload {
    data: UserData;
    exp: number;
    token_type: TokenType
}

function getUserDataFromToken(token: string): UserData {
    // Based on:
    // - https://medium.com/@feldjesus/how-to-decode-a-jwt-token-175305335024
    const tokenParts: Array<string> = token.split('.');
    const payload: TokenPayload = JSON.parse(atob(tokenParts[1]));
    return payload.data;
}

export {getUserDataFromToken};
