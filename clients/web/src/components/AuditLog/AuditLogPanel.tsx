import * as React from 'react';
import UserEventsAuditLog from "./UserEventsAuditLog.tsx";
import AuditLogPanelProps from "./AuditLogPanelProps.ts";

function AuditLogPanel({
                           userAuditLogState,
                           setUserAuditLogState
                       }: AuditLogPanelProps): React.ReactNode {
    return (
        <div className='panel'>
            <UserEventsAuditLog userAuditLogState={userAuditLogState}
                                setUserAuditLogState={setUserAuditLogState}/>
        </div>
    )
}

export default AuditLogPanel;
