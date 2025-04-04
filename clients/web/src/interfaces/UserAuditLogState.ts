import {UserEvent} from "../utils/api.ts";

interface UserAuditLogState {
    numTotalItems?: number;
    numItemsInPage?: number;
    pageNumber: number;
    events: Array<UserEvent>;
}

export default UserAuditLogState;