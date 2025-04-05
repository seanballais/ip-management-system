import * as React from 'react';
import AddIPAddressForm from "./AddIPAddressForm.tsx";
import IPAddressTable from "./IPAddressTable.tsx";
import {IPAddressTableProps} from "./props.ts";

function IPAddressPanel({
                            ipAddressTableState,
                            setIPAddressTableState
                        }: IPAddressTableProps): React.ReactNode {
    return (
        <div>
            <AddIPAddressForm/>
            <IPAddressTable ipAddressTableState={ipAddressTableState}
                            setIPAddressTableState={setIPAddressTableState}/>
        </div>
    );
}

export default IPAddressPanel;
