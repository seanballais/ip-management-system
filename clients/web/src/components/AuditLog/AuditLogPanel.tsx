import * as React from 'react';
import UserEventsAuditLog from "./UserEventsAuditLog.tsx";

function AuditLogPanel(): React.ReactNode {
    return (
        <div className='panel'>
            <UserEventsAuditLog/>
        </div>
    )
}

export default AuditLogPanel;
