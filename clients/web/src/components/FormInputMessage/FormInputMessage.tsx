import * as React from "react";

enum FormInputMessageType {
    Success,
    Error
}

interface Props {
    targetInput: string;
    type: FormInputMessageType;
    message?: string;
}

function FormInputMessage({
                              targetInput,
                              type,
                              message
                          }: Props): React.ReactNode {
    if (!message) {
        return null;
    }

    let className: string = 'form-input-message';
    if (type === FormInputMessageType.Success) {
        className += ' form-input-success-message';
    } else {
        className += ' form-input-error-message';
    }

    return (
        <label className={className} htmlFor={targetInput}>{message}</label>
    );
}

export {FormInputMessage, FormInputMessageType};
