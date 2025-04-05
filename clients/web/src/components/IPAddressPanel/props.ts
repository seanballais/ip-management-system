import IPAddressDataState from "./IPAddressDataState.tsx";
import * as React from "react";

interface IPAddressTableProps {
    ipAddressTableState: IPAddressDataState;
    setIPAddressTableState: React.Dispatch<React.SetStateAction<IPAddressDataState>>;
}

export type {IPAddressTableProps};
