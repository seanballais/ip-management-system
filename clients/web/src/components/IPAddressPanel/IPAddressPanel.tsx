import * as React from 'react';
import AddIPAddressForm from "./AddIPAddressForm.tsx";
import IPAddressTable from "./IPAddressTable.tsx";
import {IPAddressPanelProps} from "./props.ts";

function IPAddressPanel({
                            addIPAddressFormCallback,
                            editIPAddressTableRowCallback,
                            ipAddressTableState,
                            setIPAddressTableState
                        }: IPAddressPanelProps): React.ReactNode {
    return (
        <div>
            <AddIPAddressForm callback={addIPAddressFormCallback}/>
            <IPAddressTable ipAddressTableState={ipAddressTableState}
                            setIPAddressTableState={setIPAddressTableState}
                            editIPAddressTableRowCallback={editIPAddressTableRowCallback}/>
        </div>
    );
}

export default IPAddressPanel;
