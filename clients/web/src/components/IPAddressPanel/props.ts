import IPAddressDataState from "./IPAddressDataState.tsx";
import * as React from "react";
import {CallbackFunc} from "../../utils/types.ts";

interface IPAddressPanelProps {
    addIPAddressFormCallback: CallbackFunc;
    ipAddressTableState: IPAddressDataState;
    setIPAddressTableState: React.Dispatch<React.SetStateAction<IPAddressDataState>>;
}

interface IPAddressTableProps {
    ipAddressTableState: IPAddressDataState;
    setIPAddressTableState: React.Dispatch<React.SetStateAction<IPAddressDataState>>;
}

export type {IPAddressPanelProps, IPAddressTableProps};
