import {IP} from "../../utils/api.ts";

interface IPAddressDataState {
    numTotalItems?: number;
    numItemsInPage?: number;
    pageNumber: number;
    ips: Array<IP>;
}

export default IPAddressDataState;
