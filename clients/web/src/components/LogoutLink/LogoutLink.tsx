import * as React from 'react';
import {post} from "../../utils/api.ts";
import {
    ACCESS_TOKEN_STORAGE_NAME, clearTokens,
    REFRESH_TOKEN_STORAGE_NAME
} from "../../utils/tokens.ts";

interface LogoutBodyData {
    access_token: string;
    refresh_token: string;
}

function LogoutLink(): React.ReactNode {
    async function handleLogout(event: React.MouseEvent<HTMLElement>): Promise<void> {
        event.preventDefault();

        const accessToken: string = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME) ?? '';
        const refreshToken: string = localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME) ?? '';

        const bodyData: LogoutBodyData = {
            access_token: accessToken,
            refresh_token: refreshToken
        };

        // The response is not that important, so we can ignore it. Even if the
        // API call fails, we can still log out the user.
        await post('/logout', JSON.stringify(bodyData));

        clearTokens();

        // This should let us go back to the initial state.
        window.location.reload();
    }

    return <a href='#' onClick={handleLogout}>Logout</a>;
}

export default LogoutLink;
