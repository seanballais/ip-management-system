import {IPEvent} from "../../utils/api.ts";

interface IPAuditLogState {
    numTotalItems?: number;
    numItemsInPage?: number;
    pageNumber: number;
    events: Array<IPEvent>;
}

export default IPAuditLogState;