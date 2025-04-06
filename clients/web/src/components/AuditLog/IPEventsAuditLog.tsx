import * as React from 'react';
import {useRef, useState} from "react";
import {IPEventsPanelProps} from "./props.ts";
import {
    FailedJSONResponse, fetchIPAuditLogData, IPAuditLog,
    IPAuditLogJSONResponse, IPEvent,
    MAX_NUM_ITEMS_PER_PAGE,
} from "../../utils/api.ts";
import {clearTokens} from "../../utils/tokens.ts";
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

    return (
        <div className='panel-audit-log margin-top-32px max-width-initial'
             ref={logRef}>
            <h1>IP Address Events</h1>
            <table>
                <thead>
                <tr>
                    <th scope='col'>Recorded On (UTC)</th>
                    <th scope='col'>IP Address</th>
                    <th scope='col'>Label</th>
                    <th scope='col'>Created By</th>
                    <th scope='col'>Event</th>
                    <th scope='col'>Event Triggered By</th>
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

function IPAuditLogRows({
                            parentState,
                            dataState
                        }: IPAuditLogRowsState): React.ReactNode {
    if (dataState.events.length === 0) {
        if (parentState.isLoadingData) {
            return (
                <tr className='text-align-center'>
                    <td colSpan={6}>Loading data...</td>
                </tr>
            );
        } else {
            return (
                <tr className='text-align-center'>
                    <td colSpan={6}>No user event logged.</td>
                </tr>
            );
        }
    }

    return (
        dataState.events.map((event: IPEvent): React.ReactNode => (
            <tr key={event.id}>
                <td>{event.recorded_on}</td>
                <td>{event.ip.ip_address}</td>
                <td>{event.ip.label}</td>
                <td>@{event.ip.recorder.username}</td>
                <td>
                    <EventCellData event={event}/>
                </td>
                <th scope='row'>@{event.trigger_user.username}</th>
            </tr>
        ))
    );
}

interface DataDelta {
    oldValue: any;
    newValue: any;
}

interface EventCellDataProps {
    event: IPEvent;
}

enum BaseEventType {
    ADDED,
    MODIFIED,
    DELETED,
    NO_EVENT
}

interface EventCellDataDiff {
    eventID: number;
    baseEventType: BaseEventType;
    changes: { [attribute: string]: DataDelta };
}

function EventCellData({event}: EventCellDataProps): React.ReactNode {
    let eventType: string;
    let diff: EventCellDataDiff = {
        eventID: event.id,
        baseEventType: BaseEventType.NO_EVENT,
        changes: {}
    };
    switch (event.type) {
        case 'ip_address_added': {
            eventType = 'Added IP address.'
            diff.baseEventType = BaseEventType.ADDED;
            break;
        }
        case 'ip_address_modified_ip': {
            eventType = 'Modified IP address.';
            diff.baseEventType = BaseEventType.MODIFIED;
            break;
        }
        case 'ip_address_modified_ip_label': {
            eventType = 'Modified IP address and label.';
            diff.baseEventType = BaseEventType.MODIFIED;
            break;
        }
        case 'ip_address_modified_ip_comment': {
            eventType = 'Modified IP address and comment.';
            diff.baseEventType = BaseEventType.MODIFIED;
            break;
        }
        case 'ip_address_modified_ip_label_comment': {
            eventType = 'Modified IP address, label, and comment.';
            diff.baseEventType = BaseEventType.MODIFIED;
            break;
        }
        case 'ip_address_modified_label': {
            eventType = 'Modified label';
            diff.baseEventType = BaseEventType.MODIFIED;
            break;
        }
        case 'ip_address_modified_label_comment': {
            eventType = 'Modified label and comment.';
            diff.baseEventType = BaseEventType.MODIFIED;
            break;
        }
        case 'ip_address_modified_comment': {
            eventType = 'Modified comment.';
            diff.baseEventType = BaseEventType.MODIFIED;
            break;
        }
        case 'ip_address_deleted': {
            eventType = 'Deleted IP Address.';
            diff.baseEventType = BaseEventType.DELETED;
            break;
        }
        default: {
            eventType = 'Unknown Event';
            diff.baseEventType = BaseEventType.NO_EVENT;
        }
    }

    if (event.new_data && event.new_data.ip_address !== undefined) {
        diff.changes['IP Address'] = {
            oldValue: event.old_data.ip_address,
            newValue: event.new_data.ip_address
        };
    }

    if (event.new_data && event.new_data.label !== undefined) {
        diff.changes['Label'] = {
            oldValue: event.old_data.label,
            newValue: event.new_data.label
        };
    }

    if (event.new_data && event.new_data.comment !== undefined) {
        diff.changes['Comment'] = {
            oldValue: event.old_data.comment,
            newValue: event.new_data.comment
        };
    }

    return (
        <>
            <p>{eventType}</p>
            <EventCellDiff diff={diff}/>
        </>
    );
}

interface EventCellDiffProps {
    diff: EventCellDataDiff
}

function EventCellDiff({diff}: EventCellDiffProps): React.ReactNode {
    if (diff.baseEventType === BaseEventType.NO_EVENT) {
        return null;
    }

    return (
        <ul className='audit-log-diff-list'>
            {
                Object.entries(diff.changes).map(
                    ([attribute, delta]: [string, DataDelta]) => (
                        <li key={diff.eventID + attribute}>
                            {attribute}: {delta.oldValue && <>{delta.oldValue}&nbsp;&rarr;&nbsp;</>}{delta.newValue}
                        </li>
                    )
                )
            }
        </ul>
    );
}

export default IPEventsAuditLog;
