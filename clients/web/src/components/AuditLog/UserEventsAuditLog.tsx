import * as React from 'react';
import {useRef, useState} from "react";
import {
    FailedJSONResponse,
    fetchUserAuditLogData,
    MAX_NUM_ITEMS_PER_PAGE, UserAuditLog, UserAuditLogJSONResponse,
    UserEvent
} from "../../utils/api.ts";
import {UserAuditLogState} from "../../interfaces.ts";
import {clearTokens} from "../../utils/tokens.ts";
import {capitalizeString} from "../../utils/strings.ts";
import {UserEventsPanelProps} from "./props.ts";

interface LogState {
    isLoadingData: boolean;
    areButtonsEnabled: boolean
}

interface UserAuditLogRowsState {
    parentState: LogState;
    dataState: UserAuditLogState;
}

function UserEventsAuditLog({
                                userAuditLogState,
                                setUserAuditLogState
                            }: UserEventsPanelProps): React.ReactNode {
    const logRef = useRef<HTMLDivElement>(null);

    const numPages: number = Math.ceil((userAuditLogState.numTotalItems ?? 0) / MAX_NUM_ITEMS_PER_PAGE);
    let [state, setState] = useState<LogState>({
        isLoadingData: false,
        areButtonsEnabled: true
    });

    function handlePreviousButtonClick(): void {
        if (isFirstPage()) {
            return;
        }

        getPage(userAuditLogState.pageNumber - 1);
    }

    function handleNextButtonClick(): void {
        if (isLastPage()) {
            return;
        }

        getPage(userAuditLogState.pageNumber + 1);
    }

    function isFirstPage(): boolean {
        return userAuditLogState.pageNumber == 0;
    }

    function isLastPage(): boolean {
        return userAuditLogState.pageNumber + 1 >= numPages;
    }

    function getPage(pageNumber: number) {
        logRef.current?.scrollIntoView();

        setState((state: LogState): LogState => ({
            ...state,
            isLoadingData: true,
            areButtonsEnabled: false
        }));

        // Empty the events.
        setUserAuditLogState((state: UserAuditLogState): UserAuditLogState => ({
            ...state,
            events: []
        }));

        fetchUserAuditLogData(MAX_NUM_ITEMS_PER_PAGE, pageNumber)
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

                setState((state: LogState): LogState => ({
                    ...state,
                    isLoadingData: false,
                    areButtonsEnabled: true
                }));
            })
            .catch((): void => {
                // Tokens are already invalid, so we need to remove the tokens
                // in storage. We reload so that we are back in the login page.
                clearTokens();
                window.location.reload();
            });
    }

    function UserAuditLogRows({
                                  parentState,
                                  dataState
                              }: UserAuditLogRowsState): React.ReactNode {
        if (dataState.events.length === 0) {
            if (parentState.isLoadingData) {
                return (
                    <tr className='text-align-center'>
                        <td colSpan={3}>Loading data...</td>
                    </tr>
                );
            } else {
                return (
                    <tr className='text-align-center'>
                        <td colSpan={3}>No user event logged.</td>
                    </tr>
                );
            }
        }

        return (
            dataState.events.map((event: UserEvent): React.ReactNode => (
                <tr key={event.id}>
                    <td>{event.recorded_on}</td>
                    <td>{capitalizeString(event.type)}</td>
                    <th scope='row'>@{event.user.username}</th>
                </tr>
            ))
        )
    }

    return (
        <div className='panel-audit-log' ref={logRef}>
            <h1>User Events</h1>
            <table>
                <thead>
                <tr>
                    <th scope='col'>Recorded On (UTC)</th>
                    <th scope='col'>Event Type</th>
                    <th scope='col'>User</th>
                </tr>
                </thead>
                <tbody>
                <UserAuditLogRows parentState={state}
                                  dataState={userAuditLogState}/>
                </tbody>
            </table>
            <div className='row pagination-row'>
                <button
                    className={isFirstPage() ? 'previous-button invisible' : 'previous-button'}
                    disabled={!state.areButtonsEnabled}
                    onClick={handlePreviousButtonClick}>&larr; Previous
                </button>
                <div
                    className='page-number'>{userAuditLogState.pageNumber + 1}/{numPages}</div>
                <button
                    className={isLastPage() ? 'next-button invisible' : 'next-button'}
                    disabled={!state.areButtonsEnabled}
                    onClick={handleNextButtonClick}>Next &rarr;</button>
            </div>
        </div>
    );
}

export default UserEventsAuditLog;
