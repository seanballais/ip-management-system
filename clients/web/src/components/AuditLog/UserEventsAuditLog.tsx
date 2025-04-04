import * as React from 'react';
import AuditLogPanelProps from "./AuditLogPanelProps.ts";
import {UserEvent} from "../../utils/api.ts";

function UserEventsAuditLog({
                                userAuditLogState,
                                setUserAuditLogState
                            }: AuditLogPanelProps): React.ReactNode {
    return (
        <div id='user-events-audit-log'>
            <h1>User Events</h1>
            <table>
                <thead>
                <tr>
                    <th scope='col'>Recorded On (UTC+0)</th>
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
        </div>
    );
}

export default UserEventsAuditLog;
