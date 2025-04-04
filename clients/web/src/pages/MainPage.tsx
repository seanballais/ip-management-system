import * as React from 'react';
import {useEffect, useState} from 'react';
import LogoutLink from "../components/LogoutLink/LogoutLink.tsx";
import {
    FailedJSONResponse, GenericBodyData,
    postWithTokenRefresh,
    QueryParameters,
    User, UserAuditLog,
    UserAuditLogJSONResponse
} from "../utils/api.ts";
import {
    ACCESS_TOKEN_STORAGE_NAME, clearTokens,
    getUserDataFromToken
} from "../utils/tokens.ts";
import AuditLogPanel from "../components/AuditLog/AuditLogPanel.tsx";
import {UserAuditLogState} from "../interfaces.ts";

function MainPage(): React.ReactNode {
    const [userAuditLogState, setUserAuditLogState] = useState<UserAuditLogState>({
        pageNumber: 0,
        events: []
    });

    const accessToken: string = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME) ?? '';
    const userData: User = getUserDataFromToken(accessToken);

    const NUM_ITEMS_PER_PAGE: number = 25;
    const PAGE_NUMBER: number = 0;

    useEffect((): void => {
        fetchUserAuditLogData(NUM_ITEMS_PER_PAGE, PAGE_NUMBER)
            .then(async (response: Response): Promise<UserAuditLogJSONResponse> => {
                if (response.ok) {
                    return await response.json();
                }

                const {detail}: FailedJSONResponse = await response.json();
                const errorCode: string = detail.errors[0].code;
                throw new Error(`Error code: ${errorCode}`);
            })
            .then((responseData: UserAuditLogJSONResponse): void => {
                const data: UserAuditLog = responseData.data;
                setUserAuditLogState((state: UserAuditLogState): UserAuditLogState => ({
                    ...state,
                    numTotalItems: data.num_total_items,
                    numItemsInPage: data.count,
                    pageNumber: data.page_number,
                    events: data.events
                }));
            })
            .catch((e: unknown): void => {
                // Tokens are already invalid, so we need to remove the tokens
                // in storage. We reload so that we are back in the login page.
                clearTokens();
                window.location.reload();
            });
    }, []);

    async function fetchUserAuditLogData(numItemsPerPage: number, pageNumber: number): Promise<Response> {
        const bodyData: GenericBodyData = {
            access_token: accessToken
        };
        const queryParams: QueryParameters = {
            numItemsPerPage: numItemsPerPage,
            pageNumber: pageNumber
        };
        try {
            return await postWithTokenRefresh('/audit-log/users', bodyData, queryParams);
        } catch (e: unknown) {
            throw e as Error;
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
                <AuditLogPanel userAuditLogState={userAuditLogState}
                               setUserAuditLogState={setUserAuditLogState}/>
            </section>
        </>
    );
}

export default MainPage;
