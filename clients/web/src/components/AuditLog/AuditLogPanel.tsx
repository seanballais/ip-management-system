import * as React from 'react';
import UserEventsAuditLog from "./UserEventsAuditLog.tsx";
import IPEventsAuditLog from "./IPEventsAuditLog.tsx";
import './AuditLogPanel.css';
import {AuditLogPanelProps} from "./props.ts";

function AuditLogPanel({
                           userAuditLogState,
                           ipAuditLogState,
                           setUserAuditLogState,
                           setIPAuditLogState
                       }: AuditLogPanelProps): React.ReactNode {
    return (
        <div className='panel'>
            <UserEventsAuditLog userAuditLogState={userAuditLogState}
                                setUserAuditLogState={setUserAuditLogState}/>
            <IPEventsAuditLog ipAuditLogState={ipAuditLogState}
                              setIPAuditLogState={setIPAuditLogState}/>
        </div>
    )
}

export default AuditLogPanel;
