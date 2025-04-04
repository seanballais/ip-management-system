import * as React from 'react';
import LogoutLink from "../components/LogoutLink/LogoutLink.tsx";
import {
    postWithTokenRefresh,
    QueryParameters, UserAuditLogJSONResponse
} from "../utils/api.ts";
import UserData from "../interfaces/UserData.ts";
import {
    ACCESS_TOKEN_STORAGE_NAME, clearTokens,
    getUserDataFromToken
} from "../utils/tokens.ts";
import AuditLogPanel from "../components/AuditLog/AuditLogPanel.tsx";
import {useEffect} from "react";

interface RequestWithTokenBodyData {
    access_token: string;
}

function MainPage(): React.ReactNode {
    const accessToken: string = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME) ?? '';
    const userData: UserData = getUserDataFromToken(accessToken);

    const NUM_ITEMS_PER_PAGE: number = 25;
    const PAGE_NUMBER: number = 0;

    useEffect((): void => {
        fetchUserAuditLogData(NUM_ITEMS_PER_PAGE, PAGE_NUMBER);
    });

    async function fetchUserAuditLogData(numItemsPerPage: number, pageNumber: number): Promise<void> {
        const bodyData: RequestWithTokenBodyData = {
            access_token: accessToken
        };
        const queryParams: QueryParameters = {
            numItemsPerPage: numItemsPerPage,
            pageNumber: pageNumber
        };
        try {
            const response: Response = await postWithTokenRefresh('/audit-log/users', JSON.stringify(bodyData), queryParams);
            if (response.ok) {
                const {data}: UserAuditLogJSONResponse = await response.json();
                console.log(data);
            }
        } catch (e: unknown) {
            // Tokens are already invalid, so we need to remove the tokens
            // in storage. We reload so that we are back in the login page.
            clearTokens();
            window.location.reload();
        }
    }

    return (
        <>
            <header className='container'>
                <div className='row'>
                    <div className='column'>
                        <p className='bold'>👋 Hey, @{userData.username}!</p>
                    </div>
                    <nav className='column align-right'>
                        <LogoutLink/>
                    </nav>
                </div>
            </header>
            <section className='container'>
                <AuditLogPanel/>
            </section>
        </>
    );
}

export default MainPage;
