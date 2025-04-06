import * as React from 'react';
import {useRef, useState} from "react";
import {
    MAX_NUM_ITEMS_PER_PAGE,
    FailedJSONResponse,
    fetchIPAddressData,
    updateIPAddressData,
    IP, IPAddressData, IPAddressDataJSONResponse, User, deleteIPAddress
} from "../../utils/api.ts";
import IPAddressDataState from './IPAddressDataState.tsx';
import {IPAddressTableProps} from "./props.ts";
import {clearTokens} from "../../utils/tokens.ts";
import {
    FormInputMessage,
    FormInputMessageType
} from "../FormInputMessage/FormInputMessage.tsx";
import {CallbackFunc} from "../../utils/types.ts";

interface TableState {
    isLoadingData: boolean;
    areButtonsEnabled: boolean
}

function IPAddressTable({
                            user,
                            ipAddressTableState,
                            setIPAddressTableState,
                            editIPAddressTableRowCallback,
                            deleteIPAddressTableRowCallback
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
                    <th scope='col'>IP Address</th>
                    <th scope='col'>Label</th>
                    <th scope='col'>Comment</th>
                    <th scope='col'>Added by</th>
                    <th scope='col'>Actions</th>
                </tr>
                </thead>
                <tbody>
                <IPAddressTableRows parentState={state}
                                    dataState={ipAddressTableState}
                                    user={user}
                                    rowEditCallback={editIPAddressTableRowCallback}
                                    rowDeleteCallback={deleteIPAddressTableRowCallback}
                                    setIPAddressTableState={setIPAddressTableState}/>
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
    user: User;
    parentState: TableState;
    dataState: IPAddressDataState;
    rowEditCallback: CallbackFunc;
    rowDeleteCallback: CallbackFunc;
    setIPAddressTableState: React.Dispatch<React.SetStateAction<IPAddressDataState>>;
}

function IPAddressTableRows({
                                user,
                                parentState,
                                dataState,
                                rowEditCallback,
                                rowDeleteCallback,
                                setIPAddressTableState
                            }: IPAddressTableRowsState): React.ReactNode {
    if (dataState.ips.length === 0) {
        if (parentState.isLoadingData) {
            return (
                <tr className='text-align-center'>
                    <td colSpan={5}>Loading data...</td>
                </tr>
            );
        } else {
            return (
                <tr className='text-align-center'>
                    <td colSpan={5}>No IP address added.</td>
                </tr>
            );
        }
    }

    return (
        dataState.ips.map((ip: IP, index: number): React.ReactNode => (
            <IPAddressTableRow key={ip.id} index={index} id={ip.id}
                               ipAddress={ip.ip_address}
                               label={ip.label} comment={ip.comment}
                               recorder={ip.recorder}
                               user={user}
                               rowEditCallback={rowEditCallback}
                               rowDeleteCallback={rowDeleteCallback}
                               setIPAddressTableState={setIPAddressTableState}/>
        ))
    );
}

interface RowProps {
    index: number,
    id: number,
    ipAddress: string,
    label: string;
    comment: string;
    recorder: User;
    user: User;
    rowEditCallback: CallbackFunc;
    rowDeleteCallback: CallbackFunc;
    setIPAddressTableState: React.Dispatch<React.SetStateAction<IPAddressDataState>>
}

enum RowMode {
    VIEWING,
    EDITING
}

interface RowState {
    ipAddress: string,
    label: string;
    comment: string;
    mode: RowMode;
    ipAddressErrorMessage?: string;
    labelErrorMessage?: string;
    isIPAddressInputEnabled: boolean;
    isLabelInputEnabled: boolean;
    isCommentInputEnabled: boolean;
    areButtonsEnabled: boolean;
}

function IPAddressTableRow({
                               index,
                               id,
                               ipAddress,
                               label,
                               comment, recorder,
                               user,
                               rowEditCallback,
                               rowDeleteCallback,
                               setIPAddressTableState
                           }: RowProps): React.ReactNode {
    const ipAddressInputRef = useRef<HTMLInputElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);
    const commentInputRef = useRef<HTMLInputElement>(null);

    const [rowState, setRowState] = useState<RowState>({
        ipAddress: ipAddress,
        label: label,
        comment: comment,
        mode: RowMode.VIEWING,
        isIPAddressInputEnabled: true,
        isLabelInputEnabled: true,
        isCommentInputEnabled: true,
        areButtonsEnabled: true
    });

    async function handleUpdateIPAddress(): Promise<void> {
        setRowState((data: RowState): RowState => ({
            ...data,
            ipAddressErrorMessage: undefined,
            labelErrorMessage: undefined,
            isIPAddressInputEnabled: false,
            isLabelInputEnabled: false,
            isCommentInputEnabled: false,
            areButtonsEnabled: false
        }));

        let ipAddressValue: string;
        if (ipAddressInputRef.current) {
            ipAddressValue = ipAddressInputRef.current.value;
        } else {
            ipAddressValue = rowState.ipAddress;
        }

        let labelValue: string;
        if (labelInputRef.current) {
            labelValue = labelInputRef.current.value;
        } else {
            labelValue = rowState.label;
        }

        let commentValue: string;
        if (commentInputRef.current) {
            commentValue = commentInputRef.current.value;
        } else {
            commentValue = rowState.comment;
        }

        if (!ipAddressValue || !labelValue) {
            if (!ipAddressValue) {
                setRowState((data: RowState): RowState => ({
                    ...data,
                    ipAddressErrorMessage: 'IP address must not be empty.'
                }));
            }

            if (!labelValue) {
                setRowState((data: RowState): RowState => ({
                    ...data,
                    labelErrorMessage: 'Label must not be empty.'
                }));
            }
        } else {
            let ipAddressUpdateValue: string | null = null;
            if (ipAddressValue != rowState.ipAddress) {
                ipAddressUpdateValue = ipAddressValue;
            }

            let labelUpdateValue: string | null = null;
            if (labelValue != rowState.label) {
                labelUpdateValue = labelValue;
            }

            let commentUpdateValue: string | null = null;
            if (commentValue != rowState.comment) {
                commentUpdateValue = commentValue
            }

            if (ipAddressUpdateValue || labelUpdateValue || commentUpdateValue) {
                const response: Response = await updateIPAddressData(id, ipAddressUpdateValue, labelUpdateValue, commentUpdateValue);
                if (response.ok) {
                    setRowState((data: RowState): RowState => ({
                        ...data,
                        ipAddress: ipAddressValue,
                        label: labelValue,
                        comment: commentValue,
                    }));

                    // Update the state in the main page.
                    setIPAddressTableState((state: IPAddressDataState): IPAddressDataState => ({
                        ...state,
                        ips: [
                            ...state.ips.slice(0, index),
                            {
                                ...state.ips[index],
                                ip_address: ipAddressValue,
                                label: labelValue,
                                comment: commentValue
                            },
                            ...state.ips.slice(index + 1)
                        ]
                    }));

                    switchRowMode();
                    rowEditCallback();
                } else {
                    const {detail}: FailedJSONResponse = await response.json();

                    // We already know that there is one error that is returned.
                    if (detail.errors[0].code === 'invalid_ip_address') {
                        setRowState((data: RowState): RowState => ({
                            ...data,
                            ipAddressErrorMessage: 'Invalid IP address.'
                        }));
                    } else if (detail.errors[0].code === 'unavailable_label') {
                        setRowState((data: RowState): RowState => ({
                            ...data,
                            labelErrorMessage: 'Label is already used.'
                        }));
                    }
                }
            } else {
                switchRowMode();
            }
        }

        setRowState((data: RowState): RowState => ({
            ...data,
            isIPAddressInputEnabled: true,
            isLabelInputEnabled: true,
            isCommentInputEnabled: true,
            areButtonsEnabled: true
        }));
    }

    async function handleDeleteIPAddress(): Promise<void> {
        setRowState((data: RowState): RowState => ({
            ...data,
            ipAddressErrorMessage: undefined,
            labelErrorMessage: undefined,
            isIPAddressInputEnabled: false,
            isLabelInputEnabled: false,
            isCommentInputEnabled: false,
            areButtonsEnabled: false
        }));

        const response: Response = await deleteIPAddress(id);
        if (response.ok) {
            rowDeleteCallback();
        }

        setRowState((data: RowState): RowState => ({
            ...data,
            isIPAddressInputEnabled: true,
            isLabelInputEnabled: true,
            isCommentInputEnabled: true,
            areButtonsEnabled: true
        }));
    }

    function switchRowMode(): void {
        if (rowState.mode === RowMode.VIEWING) {
            setRowState((state: RowState): RowState => ({
                ...state,
                mode: RowMode.EDITING
            }));
        } else {
            setRowState((state: RowState): RowState => ({
                ...state,
                mode: RowMode.VIEWING
            }));
        }

        setRowState((data: RowState): RowState => ({
            ...data,
            ipAddressErrorMessage: undefined,
            labelErrorMessage: undefined
        }));
    }

    return (
        <tr key={id}>
            {
                (rowState.mode === RowMode.VIEWING)
                    ? (
                        <>
                            <td>{rowState.ipAddress}</td>
                            <td>{rowState.label}</td>
                            <td>{rowState.comment}</td>
                            <th scope='row'>@{recorder.username}</th>
                            <td>
                                {
                                    (user.id == recorder.id || user.is_superuser)
                                        ? <button className='margin-right-1rem'
                                                  onClick={switchRowMode}>Edit</button>
                                        : null
                                }
                                {
                                    (user.is_superuser)
                                        ? <button
                                            onClick={handleDeleteIPAddress}>Delete</button>
                                        : null
                                }
                            </td>
                        </>
                    ) : (
                        <>
                            <td>
                                <div className='form-group'>
                                    <input ref={ipAddressInputRef}
                                           type='text' placeholder='IP Address'
                                           name='ipAddress'
                                           size={20}
                                           defaultValue={rowState.ipAddress}
                                           disabled={!rowState.isIPAddressInputEnabled}/>
                                    <FormInputMessage targetInput='ipAddress'
                                                      type={FormInputMessageType.Error}
                                                      message={rowState.ipAddressErrorMessage}/>
                                </div>
                            </td>
                            <td>
                                <div className='form-group'>
                                    <input ref={labelInputRef}
                                           type='text' placeholder='Label'
                                           name='label'
                                           size={20}
                                           defaultValue={rowState.label}
                                           disabled={!rowState.isLabelInputEnabled}/>
                                    <FormInputMessage targetInput='label'
                                                      type={FormInputMessageType.Error}
                                                      message={rowState.labelErrorMessage}/>
                                </div>
                            </td>
                            <td>
                                <div className='form-group'>
                                    <input ref={commentInputRef}
                                           type='text' placeholder='Comment'
                                           name='comment'
                                           size={10}
                                           defaultValue={rowState.comment}
                                           disabled={!rowState.isCommentInputEnabled}/>
                                </div>
                            </td>
                            <th scope='row'>
                                <div
                                    className='form-group'>@{recorder.username}</div>
                            </th>
                            <td>
                                <div className='margin-bottom-1rem'>
                                    <button className='margin-right-1rem'
                                            disabled={!rowState.areButtonsEnabled}
                                            onClick={handleUpdateIPAddress}>Save
                                    </button>
                                    <button disabled={!rowState.areButtonsEnabled}
                                            onClick={switchRowMode}>Cancel
                                    </button>
                                </div>
                            </td>
                        </>
                    )
            }
        </tr>
    );
}

export default IPAddressTable;
