import * as React from 'react';
import {useRef, useState} from 'react';
import './IPAddressPanel.css';
import {
    FailedJSONResponse,
    GenericBodyData,
    postWithTokenRefresh
} from "../../utils/api.ts";
import {FormInputMessage, FormInputMessageType} from "../../components.tsx";

interface AddIPFormState {
    ipAddress?: string;
    label?: string;
    comment?: string;
    ipAddressErrorMessage?: string;
    labelErrorMessage?: string;
    successMessage?: string,
    isIPAddressInputEnabled: boolean;
    isLabelInputEnabled: boolean;
    isCommentInputEnabled: boolean;
    isSubmitButtonEnabled: boolean;
}

function AddIPAddressForm(): React.ReactNode {
    const [formData, setFormData] = useState<AddIPFormState>({
        isIPAddressInputEnabled: true,
        isLabelInputEnabled: true,
        isCommentInputEnabled: true,
        isSubmitButtonEnabled: true
    });

    const ipAddressInput = useRef<HTMLInputElement>(null);
    const labelInput = useRef<HTMLInputElement>(null);
    const commentInput = useRef<HTMLInputElement>(null);

    async function handleAddIPAddress(event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>): Promise<boolean> {
        event.preventDefault();

        if (!formData.ipAddress || !formData.label || !formData.comment) {
            return false;
        }

        const bodyData: GenericBodyData = {
            ip_address: formData.ipAddress,
            label: formData.label,
            comment: formData.comment
        };
        setFormData((data: AddIPFormState): AddIPFormState => ({
            ...data,
            ipAddressErrorMessage: undefined,
            labelErrorMessage: undefined,
            successMessage: undefined,
            isIPAddressInputEnabled: false,
            isLabelInputEnabled: false,
            isCommentInputEnabled: false,
            isSubmitButtonEnabled: false
        }));

        const response: Response = await postWithTokenRefresh('/ips', bodyData);
        if (response.ok) {
            setFormData((data: AddIPFormState): AddIPFormState => ({
                ...data,
                successMessage: '🎉 IP address added successfully!',
                ipAddress: undefined,
                label: undefined,
                comment: undefined,
            }));

            if (ipAddressInput.current) {
                ipAddressInput.current.value = '';
            }

            if (labelInput.current) {
                labelInput.current.value = '';
            }

            if (commentInput.current) {
                commentInput.current.value = '';
            }
        } else {
            const {detail}: FailedJSONResponse = await response.json();

            // We already know that there is one error that is returned.
            if (detail.errors[0].code === 'invalid_ip_address') {
                setFormData((data: AddIPFormState): AddIPFormState => ({
                    ...data,
                    ipAddressErrorMessage: 'Invalid IP address.'
                }));
            } else if (detail.errors[0].code === 'unavailable_label') {
                setFormData((data: AddIPFormState): AddIPFormState => ({
                    ...data,
                    labelErrorMessage: 'Label is already used.'
                }));
            }
        }

        setFormData((data: AddIPFormState): AddIPFormState => ({
            ...data,
            isIPAddressInputEnabled: true,
            isLabelInputEnabled: true,
            isCommentInputEnabled: true,
            isSubmitButtonEnabled: true
        }));

        return false;
    }

    // Based on:
    // - https://www.w3schools.com/react/react_forms.asp
    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        const name: string = event.target.name;
        const value: string = event.target.value;
        setFormData((values: AddIPFormState): AddIPFormState => ({
            ...values,
            [name]: value,
            ipAddressErrorMessage: undefined,
            labelErrorMessage: undefined,
            successMessage: undefined,
        }));
    }

    return (
        <div
            className='form-container add-ip-address-form-container no-padding'>
            <form className='add-ip row' onSubmit={handleAddIPAddress}>
                <div className='form-group padding-1-rem column'>
                    <label htmlFor='ipAddress'>IP Address</label>
                    <input ref={ipAddressInput}
                           type='text' placeholder='IP Address'
                           name='ipAddress'
                           onChange={handleChange}
                           disabled={!formData.isIPAddressInputEnabled}
                           required/>
                    <FormInputMessage targetInput='label'
                                      type={FormInputMessageType.Success}
                                      message={formData.successMessage}/>
                    <FormInputMessage targetInput='ipAddress'
                                      type={FormInputMessageType.Error}
                                      message={formData.ipAddressErrorMessage}/>
                </div>
                <div className='form-group padding-1-rem column'>
                    <label htmlFor='label'>Label</label>
                    <input ref={labelInput}
                           type='text' placeholder='Label' name='label'
                           onChange={handleChange}
                           disabled={!formData.isLabelInputEnabled}
                           required/>
                    <FormInputMessage targetInput='label'
                                      type={FormInputMessageType.Error}
                                      message={formData.labelErrorMessage}/>
                </div>
                <div className='form-group padding-1-rem column'>
                    <label htmlFor='comment'>Comment</label>
                    <input ref={commentInput}
                           type='text'
                           placeholder='Comment' name='comment'
                           onChange={handleChange}
                           disabled={!formData.isCommentInputEnabled}/>
                </div>
                <div className='form-group padding-1-rem column'>
                    <button type='submit'
                            disabled={!formData.isSubmitButtonEnabled}>Add IP
                        Address
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddIPAddressForm;
