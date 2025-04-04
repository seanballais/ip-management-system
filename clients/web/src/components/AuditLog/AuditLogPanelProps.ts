import * as React from "react";
import UserAuditLogState from "../../interfaces/UserAuditLogState.ts";

interface AuditLogPanelProps {
    userAuditLogState: UserAuditLogState;
    setUserAuditLogState: React.Dispatch<React.SetStateAction<UserAuditLogState>>;
}

export default AuditLogPanelProps;
