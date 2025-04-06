import * as React from 'react';
import {useState} from "react";
import {
    APIError, MINIMUM_PASSWORD_LENGTH,
    put, User
} from "../../utils/api.ts";
import {
    ACCESS_TOKEN_STORAGE_NAME,
    REFRESH_TOKEN_STORAGE_NAME
} from "../../utils/tokens.ts";
import {
    FormInputMessage,
    FormInputMessageType
} from "../FormInputMessage/FormInputMessage.tsx";

interface RegistrationFormState {
    username: string;
    password1: string;
    password2: string;
    usernameInputErrorMessage?: string;
    passwordInputErrorMessage?: string;
    isUsernameInputEnabled: boolean;
    isPassword1InputEnabled: boolean;
    isPassword2InputEnabled: boolean;
    isSubmitButtonEnabled: boolean;
}

interface RegistrationBodyData {
    username: string;
    password1: string;
    password2: string;
}

interface RegistrationSuccessJSONResponse {
    data: {
        user: User,
        authorization: {
            access_token: string,
            refresh_token: string
        }
    };
}

interface RegistrationFailJSONResponse {
    detail: {
        errors: Array<APIError>
    }
}

function Registration(): React.ReactNode {
    const [formData, setFormData] = useState<RegistrationFormState>({
        username: '',
        password1: '',
        password2: '',
        isUsernameInputEnabled: true,
        isPassword1InputEnabled: true,
        isPassword2InputEnabled: true,
        isSubmitButtonEnabled: true
    });

    // Based on:
    // - https://www.w3schools.com/react/react_forms.asp
    async function handleRegistration(event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>): Promise<boolean> {
        event.preventDefault();

        if (formData.username === '' || formData.password1 === '' || formData.password2 === '') {
            return false;
        }

        const bodyData: RegistrationBodyData = {
            username: formData.username,
            password1: formData.password1,
            password2: formData.password2
        };
        setFormData((data: RegistrationFormState): RegistrationFormState => ({
            ...data,
            usernameInputErrorMessage: undefined,
            passwordInputErrorMessage: undefined,
            isUsernameInputEnabled: false,
            isPassword1InputEnabled: false,
            isPassword2InputEnabled: false,
            isSubmitButtonEnabled: false
        }));

        const response: Response = await put('/register', JSON.stringify(bodyData));
        if (response.ok) {
            const {data}: RegistrationSuccessJSONResponse = await response.json();
            localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, data.authorization.access_token);
            localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, data.authorization.refresh_token);

            // Reload so that we can change the page displayed easily.
            window.location.reload();
            return false;
        } else {
            const {detail}: RegistrationFailJSONResponse = await response.json();

            // We already know that there is one error that is returned.
            if (detail.errors[0].code === 'unavailable_username') {
                setFormData((data: RegistrationFormState): RegistrationFormState => ({
                    ...data,
                    usernameInputErrorMessage: 'Username is already taken.'
                }));
            } else if (detail.errors[0].code === 'invalid_username') {
                setFormData((data: RegistrationFormState): RegistrationFormState => ({
                    ...data,
                    usernameInputErrorMessage: 'Username must only have letters, numbers, periods, and underscores.'
                }));
            } else if (detail.errors[0].code === 'mismatched_passwords') {
                setFormData((data: RegistrationFormState): RegistrationFormState => ({
                    ...data,
                    passwordInputErrorMessage: 'The passwords do not match.'
                }));
            } else if (detail.errors[0].code === 'short_password') {
                setFormData((data: RegistrationFormState): RegistrationFormState => ({
                    ...data,
                    passwordInputErrorMessage: 'Password must have a minimum length of 12.'
                }));
            }

            setFormData((data: RegistrationFormState): RegistrationFormState => ({
                ...data,
                isUsernameInputEnabled: true,
                isPassword1InputEnabled: true,
                isPassword2InputEnabled: true,
                isSubmitButtonEnabled: true
            }));
        }

        return false;
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const name: string = event.target.name;
        const value: string = event.target.value;
        setFormData((values: RegistrationFormState): RegistrationFormState => ({
            ...values,
            [name]: value
        }));
    }

    return (
        <div className='form-container'>
            <h1>Register</h1>
            <form className='registration' onSubmit={handleRegistration}>
                <div className='form-group'>
                    <label htmlFor='username'>Username</label>
                    <input type='text' placeholder='Username' name='username'
                           onChange={handleChange}
                           disabled={!formData.isUsernameInputEnabled}
                           required/>
                    <FormInputMessage targetInput='username'
                                      type={FormInputMessageType.Error}
                                      message={formData.usernameInputErrorMessage}/>
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password</label>
                    <input type='password' placeholder='Password'
                           name='password1'
                           minLength={MINIMUM_PASSWORD_LENGTH}
                           onChange={handleChange}
                           disabled={!formData.isPassword1InputEnabled}
                           required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Confirm Password</label>
                    <input type='password' placeholder='Confirm Password'
                           name='password2'
                           minLength={MINIMUM_PASSWORD_LENGTH}
                           onChange={handleChange}
                           disabled={!formData.isPassword2InputEnabled}
                           required/>
                    <FormInputMessage targetInput='password2'
                                      type={FormInputMessageType.Error}
                                      message={formData.passwordInputErrorMessage}/>
                </div>
                <button type='submit'
                        disabled={!formData.isSubmitButtonEnabled}>Register
                </button>
            </form>
        </div>
    )
}

export default Registration;
