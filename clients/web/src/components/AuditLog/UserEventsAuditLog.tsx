import * as React from 'react';
import AuditLogPanelProps from "./AuditLogPanelProps.ts";

function UserEventsAuditLog({
                                userAuditLogState,
                                setUserAuditLogState
                            }: AuditLogPanelProps): React.ReactNode {
    console.log(userAuditLogState);

    return (
        <div id='user-events-audit-log'>
            <h1>User Events</h1>
            <table>

            </table>
        </div>
    );
}

export default UserEventsAuditLog;
