import * as React from 'react';
import './FormMessage.css';

enum FormMessageType {
    Error
}

interface FormMessageProps {
    type: FormMessageType;
    message?: string;
}

function FormMessage({message}: FormMessageProps): React.ReactNode {
    if (!message) {
        return null;
    }

    return (
        <figure className='form-message'>
            <p>{message}</p>
        </figure>
    );
}

export {FormMessage, FormMessageType};
