import * as React from 'react';
import AddIPAddressForm from "./AddIPAddressForm.tsx";
import {IPAddressTable} from "./IPAddressTable.tsx";
import {useState} from "react";
import IPAddressDataState from "./IPAddressDataState.tsx";

function IPAddressPanel(): React.ReactNode {
    const [ipAddressTableState, setIPAddressTableState] = useState<IPAddressDataState>({
        pageNumber: 0,
        ips: []
    });

    return (
        <div>
            <AddIPAddressForm/>
            <IPAddressTable ipAddressTableState={ipAddressTableState}
                            setIPAddressTableState={setIPAddressTableState}/>
        </div>
    );
}

export default IPAddressPanel;
