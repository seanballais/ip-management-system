import * as React from 'react';
import AddIPAddressForm from "./AddIPAddressForm.tsx";
import IPAddressTable from "./IPAddressTable.tsx";
import {IPAddressPanelProps} from "./props.ts";

function IPAddressPanel({
                            user,
                            addIPAddressFormCallback,
                            editIPAddressTableRowCallback,
                            deleteIPAddressTableRowCallback,
                            ipAddressTableState,
                            setIPAddressTableState
                        }: IPAddressPanelProps): React.ReactNode {
    return (
        <div>
            <AddIPAddressForm callback={addIPAddressFormCallback}/>
            <IPAddressTable user={user}
                            ipAddressTableState={ipAddressTableState}
                            setIPAddressTableState={setIPAddressTableState}
                            editIPAddressTableRowCallback={editIPAddressTableRowCallback}
                            deleteIPAddressTableRowCallback={deleteIPAddressTableRowCallback}/>
        </div>
    );
}

export default IPAddressPanel;
