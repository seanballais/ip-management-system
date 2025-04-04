import * as React from 'react';
import {useEffect, useState} from "react";
import AuditLogPanelProps from "./AuditLogPanelProps.ts";
import {MAX_NUM_ITEMS_PER_PAGE, UserEvent} from "../../utils/api.ts";

interface LogState {
    pageNumber?: number;
    numPages?: number;
}

function UserEventsAuditLog({
                                userAuditLogState,
                                setUserAuditLogState
                            }: AuditLogPanelProps): React.ReactNode {
    let [state, setState] = useState<LogState>({});

    useEffect((): void => {
        if (userAuditLogState.numTotalItems) {
            const numPages: number = Math.ceil(userAuditLogState.numTotalItems / MAX_NUM_ITEMS_PER_PAGE);
            setState((state: LogState): LogState => ({
                ...state,
                numPages: numPages
            }));
        }

        setState((state: LogState): LogState => ({
            ...state,
            pageNumber: userAuditLogState.pageNumber + 1
        }));
    }, [userAuditLogState]);

    return (
        <div className='panel-audit-log'>
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
                {
                    userAuditLogState.events.map((event: UserEvent): React.ReactNode => (
                        <tr key={event.id}>
                            <td>{event.recorded_on}</td>
                            <td>{event.type}</td>
                            <th scope='row'>@{event.user.username}</th>
                        </tr>
                    ))
                }
                </tbody>
            </table>
            <div className='row pagination-row'>
                <button className='prev-button'>&larr; Previous</button>
                <div
                    className='page-number'>{state.pageNumber}/{state.numPages}</div>
                <button className='next-button'>Next &rarr;</button>
            </div>
        </div>
    );
}

export default UserEventsAuditLog;
