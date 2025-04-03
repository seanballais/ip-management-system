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

    return <label htmlFor={targetInput}>{message}</label>;
}

export {FormInputErrorMessage};
