import * as React from 'react';
import {useRef, useState} from "react";
import {
    FailedJSONResponse,
    fetchIPAddressData,
    IP, IPAddressData, IPAddressDataJSONResponse,
    MAX_NUM_ITEMS_PER_PAGE
} from "../../utils/api.ts";
import IPAddressDataState from './IPAddressDataState.tsx';
import {IPAddressTableProps} from "./props.ts";
import {clearTokens} from "../../utils/tokens.ts";

interface TableState {
    isLoadingData: boolean;
    areButtonsEnabled: boolean
}

function IPAddressTable({
                            ipAddressTableState,
                            setIPAddressTableState
                        }: IPAddressTableProps): React.ReactNode {
    const tableRef = useRef<HTMLDivElement>(null);

    const numPages: number = Math.ceil((ipAddressTableState.numTotalItems ?? 0) / MAX_NUM_ITEMS_PER_PAGE);
    let [state, setState] = useState<TableState>({
        isLoadingData: false,
        areButtonsEnabled: true
    });

    function handlePreviousButtonClick(): void {
        if (isFirstPage()) {
            return;
        }

        getPage(ipAddressTableState.pageNumber - 1);
    }

    function handleNextButtonClick(): void {
        if (isLastPage()) {
            return;
        }

        getPage(ipAddressTableState.pageNumber + 1);
    }

    function isFirstPage(): boolean {
        return ipAddressTableState.pageNumber == 0;
    }

    function isLastPage(): boolean {
        return ipAddressTableState.pageNumber + 1 >= numPages;
    }

    function getPage(pageNumber: number) {
        tableRef.current?.scrollIntoView();

        setState((state: TableState): TableState => ({
            ...state,
            isLoadingData: true,
            areButtonsEnabled: false
        }));

        // Empty the events.
        setIPAddressTableState((state: IPAddressDataState): IPAddressDataState => ({
            ...state,
            ips: []
        }));

        fetchIPAddressData(MAX_NUM_ITEMS_PER_PAGE, pageNumber)
            .then(async (response: Response): Promise<IPAddressDataJSONResponse> => {
                if (response.ok) {
                    return await response.json();
                }

                const {detail}: FailedJSONResponse = await response.json();
                const errorCode: string = detail.errors[0].code;
                throw new Error(`Error code: ${errorCode}`);
            })
            .then((responseData: IPAddressDataJSONResponse): void => {
                const data: IPAddressData = responseData.data;
                setIPAddressTableState((state: IPAddressDataState): IPAddressDataState => ({
                    ...state,
                    numTotalItems: data.num_total_items,
                    numItemsInPage: data.count,
                    pageNumber: data.page_number,
                    ips: data.ips
                }));

                setState((state: TableState): TableState => ({
                    ...state,
                    isLoadingData: false,
                    areButtonsEnabled: true
                }));
            })
            .catch((): void => {
                // Tokens are already invalid, so we need to remove the tokens
                // in storage. We reload so that we are back in the login page.
                clearTokens();
                window.location.reload();
            });
    }

    return (
        <div
            className='ip-address-table-container max-width-initial'
            ref={tableRef}>
            <h1>IP Addresses</h1>
            <table>
                <thead>
                <tr>
                    <th scope='col'>Added On (UTC)</th>
                    <th scope='col'>IP Address</th>
                    <th scope='col'>Label</th>
                    <th scope='col'>Comment</th>
                    <th scope='col'>Added by</th>
                    <th scope='col'>Actions</th>
                </tr>
                </thead>
                <tbody>
                <IPAddressTableRows parentState={state}
                                    dataState={ipAddressTableState}/>
                </tbody>
            </table>
            <div className='row pagination-row'>
                <button
                    className={isFirstPage() ? 'previous-button invisible' : 'previous-button'}
                    disabled={!state.areButtonsEnabled}
                    onClick={handlePreviousButtonClick}>&larr; Previous
                </button>
                <div
                    className='page-number'>{ipAddressTableState.pageNumber + 1}/{numPages}</div>
                <button
                    className={isLastPage() ? 'next-button invisible' : 'next-button'}
                    disabled={!state.areButtonsEnabled}
                    onClick={handleNextButtonClick}>Next &rarr;</button>
            </div>
        </div>
    );
}

interface IPAddressTableRowsState {
    parentState: TableState;
    dataState: IPAddressDataState;
}

function IPAddressTableRows({
                                parentState,
                                dataState
                            }: IPAddressTableRowsState): React.ReactNode {
    if (dataState.ips.length === 0) {
        if (parentState.isLoadingData) {
            return (
                <tr className='text-align-center'>
                    <td colSpan={6}>Loading data...</td>
                </tr>
            );
        } else {
            return (
                <tr className='text-align-center'>
                    <td colSpan={6}>No IP address added.</td>
                </tr>
            );
        }
    }

    return (
        dataState.ips.map((ip: IP): React.ReactNode => (
            <tr key={ip.id}>
                <td>{ip.created_on}</td>
                <td>{ip.ip_address}</td>
                <td>{ip.label}</td>
                <td>{ip.comment}</td>
                <th scope='row'>@{ip.recorder.username}</th>
                <td>
                    <button>Edit</button>
                </td>
            </tr>
        ))
    );
}

export default IPAddressTable;
