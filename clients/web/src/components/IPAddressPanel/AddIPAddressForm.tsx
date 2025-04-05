import * as React from 'react';
import {useState} from "react";
import './IPAddressPanel.css';

interface AddIPFormState {
    ipAddress?: string;
    label?: string;
    comment?: string;
    ipAddressErrorMessage?: string;
    labelErrorMessage?: string;
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

    // Based on:
    // - https://www.w3schools.com/react/react_forms.asp
    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        const name: string = event.target.name;
        const value: string = event.target.value;
        setFormData((values: AddIPFormState): AddIPFormState => ({
            ...values,
            [name]: value
        }));
    }

    return (
        <div className='form-container add-ip-address-form-container'>
            <form className='add-ip row'>
                <div className='form-group column'>
                    <label htmlFor='ip-address'>IP Address</label>
                    <input type='text' placeholder='IP Address'
                           name='ip-address'
                           onChange={handleChange}
                           disabled={!formData.isIPAddressInputEnabled}
                           required/>
                </div>
                <div className='form-group column'>
                    <label htmlFor='label'>Label</label>
                    <input type='text' placeholder='Label' name='label'
                           onChange={handleChange}
                           disabled={!formData.isLabelInputEnabled}
                           required/>
                </div>
                <div className='form-group column'>
                    <label htmlFor='comment'>Comment</label>
                    <input type='text' placeholder='Comment' name='comment'
                           onChange={handleChange}
                           disabled={!formData.isCommentInputEnabled}
                           required/>
                </div>
                <div className='form-group column'>
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
