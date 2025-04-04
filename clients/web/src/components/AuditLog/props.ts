import * as React from "react";
import UserAuditLogState from "./UserAuditLogState.ts";
import IPAuditLogState from "./IPAuditLogState.ts";

interface UserEventsPanelProps {
    userAuditLogState: UserAuditLogState;
    setUserAuditLogState: React.Dispatch<React.SetStateAction<UserAuditLogState>>;
}

interface IPEventsPanelProps {
    ipAuditLogState: IPAuditLogState;
    setIPAuditLogState: React.Dispatch<React.SetStateAction<IPAuditLogState>>;
}

interface AuditLogPanelProps {
    userAuditLogState: UserAuditLogState;
    ipAuditLogState: IPAuditLogState;
    setUserAuditLogState: React.Dispatch<React.SetStateAction<UserAuditLogState>>;
    setIPAuditLogState: React.Dispatch<React.SetStateAction<IPAuditLogState>>;
}

export type {UserEventsPanelProps, IPEventsPanelProps, AuditLogPanelProps};
