import * as React from 'react';
import {useEffect, useState} from 'react';
import LogoutLink from "../components/LogoutLink/LogoutLink.tsx";
import {
    FailedJSONResponse,
    fetchIPAddressData,
    fetchIPAuditLogData,
    fetchUserAuditLogData, IPAddressData,
    IPAddressDataJSONResponse,
    IPAuditLog,
    IPAuditLogJSONResponse,
    MAX_NUM_ITEMS_PER_PAGE,
    User,
    UserAuditLog,
    UserAuditLogJSONResponse
} from "../utils/api.ts";
import {
    ACCESS_TOKEN_STORAGE_NAME, clearTokens,
    getUserDataFromToken
} from "../utils/tokens.ts";
import AuditLogPanel from "../components/AuditLog/AuditLogPanel.tsx";
import {UserAuditLogState} from "../interfaces.ts";
import IPAuditLogState from "../components/AuditLog/IPAuditLogState.ts";
import {IPAddressPanel, TabBar} from "../components.tsx";
import TabBarState from "../components/TabBar/TabBarState.ts";
import IPAddressDataState
    from "../components/IPAddressPanel/IPAddressDataState.tsx";

function MainPage(): React.ReactNode {
    const accessToken: string = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME) ?? '';
    const userData: User = getUserDataFromToken(accessToken);

    let tabNames: Array<string> = ['IP Addresses'];
    if (userData.is_superuser) {
        tabNames.push('Audit Log');
    }
    const [tabBarState, setTabBarState] = useState<TabBarState>({
        tabNames: tabNames,
        activeTabIndex: 0
    });

    const [ipAddressTableState, setIPAddressTableState] = useState<IPAddressDataState>({
        pageNumber: 0,
        ips: []
    });
    const [userAuditLogState, setUserAuditLogState] = useState<UserAuditLogState>({
        pageNumber: 0,
        events: []
    });
    const [ipAuditLogState, setIPAuditLogState] = useState<IPAuditLogState>({
        pageNumber: 0,
        events: []
    });

    useEffect((): void => {
        void fetchData();
    }, []);

    async function fetchData(): Promise<void> {
        await fetchIPAddressTableData();

        if (userData.is_superuser) {
            await fetchAuditLogData();
        }
    }

    async function refetchAuditLogOnTableEdit(): Promise<void> {
        if (userData.is_superuser) {
            await fetchAuditLogData();
        }
    }

    async function fetchIPAddressTableData(): Promise<void> {
        await fetchIPAddressData(MAX_NUM_ITEMS_PER_PAGE, 0)
            .then(async (response: Response): Promise<IPAddressDataJSONResponse> => {
                if (response.ok) {
                    return await response.json();
                }

                const {detail}: FailedJSONResponse = await response.json();
                const errorCode: string = detail.errors[0].code;
                throw new Error(`Error code: ${errorCode}`);
            })
            .then((responseData: IPAddressDataJSONResponse): void => {
                const data: IPAddressData = responseData.data;
                setIPAddressTableState((state: IPAddressDataState): IPAddressDataState => ({
                    ...state,
                    numTotalItems: data.num_total_items,
                    numItemsInPage: data.count,
                    pageNumber: data.page_number,
                    ips: data.ips
                }));
            })
            .catch((): void => {
                // Tokens are already invalid, so we need to remove the tokens
                // in storage. We reload so that we are back in the login page.
                clearTokens();
                window.location.reload();
            });
    }

    async function fetchAuditLogData(): Promise<void> {
        await fetchUserAuditLogData(MAX_NUM_ITEMS_PER_PAGE, 0)
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
            .catch((): void => {
                // Tokens are already invalid, so we need to remove the tokens
                // in storage. We reload so that we are back in the login page.
                clearTokens();
                window.location.reload();
            });
        await fetchIPAuditLogData(MAX_NUM_ITEMS_PER_PAGE, 0)
            .then(async (response: Response): Promise<IPAuditLogJSONResponse> => {
                if (response.ok) {
                    return await response.json();
                }

                const {detail}: FailedJSONResponse = await response.json();
                const errorCode: string = detail.errors[0].code;
                throw new Error(`Error code: ${errorCode}`);
            })
            .then((responseData: IPAuditLogJSONResponse): void => {
                const data: IPAuditLog = responseData.data;
                setIPAuditLogState((state: IPAuditLogState): IPAuditLogState => ({
                    ...state,
                    numTotalItems: data.num_total_items,
                    numItemsInPage: data.count,
                    pageNumber: data.page_number,
                    events: data.events
                }));
            })
            .catch((): void => {
                // Tokens are already invalid, so we need to remove the tokens
                // in storage. We reload so that we are back in the login page.
                clearTokens();
                window.location.reload();
            });
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
                <TabBar tabBarState={tabBarState}
                        setTabBarState={setTabBarState}/>
                {
                    (tabBarState.activeTabIndex == 0)
                        ? <IPAddressPanel
                            user={userData}
                            ipAddressTableState={ipAddressTableState}
                            setIPAddressTableState={setIPAddressTableState}
                            addIPAddressFormCallback={fetchData}
                            editIPAddressTableRowCallback={refetchAuditLogOnTableEdit}/>
                        : <AuditLogPanel userAuditLogState={userAuditLogState}
                                         ipAuditLogState={ipAuditLogState}
                                         setUserAuditLogState={setUserAuditLogState}
                                         setIPAuditLogState={setIPAuditLogState}/>
                }
            </section>
        </>
    );
}

export default MainPage;
