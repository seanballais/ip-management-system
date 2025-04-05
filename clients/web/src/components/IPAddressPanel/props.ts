import IPAddressDataState from "./IPAddressDataState.tsx";
import * as React from "react";
import {CallbackFunc} from "../../utils/types.ts";
import {User} from "../../utils/api.ts";

interface IPAddressPanelProps {
    user: User;
    addIPAddressFormCallback: CallbackFunc;
    editIPAddressTableRowCallback: CallbackFunc;
    deleteIPAddressTableRowCallback: CallbackFunc;
    ipAddressTableState: IPAddressDataState;
    setIPAddressTableState: React.Dispatch<React.SetStateAction<IPAddressDataState>>;
}

interface IPAddressTableProps {
    user: User;
    editIPAddressTableRowCallback: CallbackFunc;
    deleteIPAddressTableRowCallback: CallbackFunc;
    ipAddressTableState: IPAddressDataState;
    setIPAddressTableState: React.Dispatch<React.SetStateAction<IPAddressDataState>>;
}

export type {IPAddressPanelProps, IPAddressTableProps};
