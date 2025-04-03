import * as React from 'react';
import './FormInputErrorMessage.css';

interface Props {
    targetInput: string;
    message?: string;
}

function FormInputErrorMessage({
                                   targetInput,
                                   message
                               }: Props): React.ReactNode {
    if (!message) {
        return null;
    }

    return (
        <label className='form-input-error-message'
               htmlFor={targetInput}>{message}</label>
    );
}

export {FormInputErrorMessage};
