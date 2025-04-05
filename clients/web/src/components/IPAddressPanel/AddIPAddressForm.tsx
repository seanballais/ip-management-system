import * as React from 'react';
import {useState} from "react";

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
        <div className='form-container'>
            <h1>Login</h1>
            <form className='add-ip'>
                <div className='form-group'>
                    <label htmlFor='ip-address'>IP Address</label>
                    <input type='text' placeholder='IP Address'
                           name='ip-address'
                           onChange={handleChange}
                           disabled={!formData.isIPAddressInputEnabled}
                           required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='label'>Label</label>
                    <input type='text' placeholder='Label' name='label'
                           onChange={handleChange}
                           disabled={!formData.isLabelInputEnabled}
                           required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='comment'>comment</label>
                    <textarea name='comment'
                              onChange={handleChange}
                              disabled={!formData.isCommentInputEnabled}></textarea>
                </div>
                <button type='submit'
                        disabled={!formData.isSubmitButtonEnabled}>Add IP
                    Address
                </button>
            </form>
        </div>
    );
}

export default AddIPAddressForm;
