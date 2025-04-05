import * as React from 'react';
import {useRef, useState} from "react";
import {IPEventsPanelProps} from "./props.ts";
import {
    FailedJSONResponse, fetchIPAuditLogData, IPAuditLog,
    IPAuditLogJSONResponse, IPEvent,
    MAX_NUM_ITEMS_PER_PAGE,
} from "../../utils/api.ts";
import {clearTokens} from "../../utils/tokens.ts";
import {capitalizeString} from "../../utils/strings.ts";
import IPAuditLogState from "./IPAuditLogState.ts";

interface LogState {
    isLoadingData: boolean;
    areButtonsEnabled: boolean
}

interface IPAuditLogRowsState {
    parentState: LogState;
    dataState: IPAuditLogState;
}

function IPEventsAuditLog({
                              ipAuditLogState, setIPAuditLogState
                          }: IPEventsPanelProps): React.ReactNode {
    const logRef = useRef<HTMLDivElement>(null);

    const numPages: number = Math.ceil((ipAuditLogState.numTotalItems ?? 0) / MAX_NUM_ITEMS_PER_PAGE);
    let [state, setState] = useState<LogState>({
        isLoadingData: false,
        areButtonsEnabled: true
    });

    function handlePreviousButtonClick(): void {
        if (isFirstPage()) {
            return;
        }

        getPage(ipAuditLogState.pageNumber - 1);
    }

    function handleNextButtonClick(): void {
        if (isLastPage()) {
            return;
        }

        getPage(ipAuditLogState.pageNumber + 1);
    }

    function isFirstPage(): boolean {
        return ipAuditLogState.pageNumber == 0;
    }

    function isLastPage(): boolean {
        return ipAuditLogState.pageNumber + 1 >= numPages;
    }

    function getPage(pageNumber: number) {
        logRef.current?.scrollIntoView();

        setState((state: LogState): LogState => ({
            ...state,
            isLoadingData: true,
            areButtonsEnabled: false
        }));

        // Empty the events.
        setIPAuditLogState((state: IPAuditLogState): IPAuditLogState => ({
            ...state,
            events: []
        }));

        fetchIPAuditLogData(MAX_NUM_ITEMS_PER_PAGE, pageNumber)
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

    function IPAuditLogRows({
                                parentState,
                                dataState
                            }: IPAuditLogRowsState): React.ReactNode {
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
            dataState.events.map((event: IPEvent): React.ReactNode => (
                <tr key={event.id}>
                    <td>{event.recorded_on}</td>
                    <td>{capitalizeString(event.type)}</td>
                    <th scope='row'>@{event.trigger_user.username}</th>
                </tr>
            ))
        )
    }

    return (
        <div className='panel-audit-log margin-top-32px max-width-initial'
             ref={logRef}>
            <h1>IP Address Events</h1>
            <table>
                <thead>
                <tr>
                    <th scope='col'>Recorded On (UTC)</th>
                    <th scope='col'>Event Type</th>
                    <th scope='col'>User</th>
                </tr>
                </thead>
                <tbody>
                <IPAuditLogRows parentState={state}
                                dataState={ipAuditLogState}/>
                </tbody>
            </table>
            <div className='row pagination-row'>
                <button
                    className={isFirstPage() ? 'previous-button invisible' : 'previous-button'}
                    disabled={!state.areButtonsEnabled}
                    onClick={handlePreviousButtonClick}>&larr; Previous
                </button>
                <div
                    className='page-number'>{ipAuditLogState.pageNumber + 1}/{numPages}</div>
                <button
                    className={isLastPage() ? 'next-button invisible' : 'next-button'}
                    disabled={!state.areButtonsEnabled}
                    onClick={handleNextButtonClick}>Next &rarr;</button>
            </div>
        </div>
    );
}

export default IPEventsAuditLog;
