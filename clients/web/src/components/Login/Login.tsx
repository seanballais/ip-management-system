import * as React from 'react';
import {useState} from 'react';
import {
    APIError,
    post,
    User
} from "../../utils/api.ts";
import {FormMessage, FormMessageType} from "../../components.tsx";
import {
    ACCESS_TOKEN_STORAGE_NAME,
    REFRESH_TOKEN_STORAGE_NAME
} from "../../utils/tokens.ts";

import './Login.css';

interface LoginFormState {
    username: string;
    password: string;
    errorMessage?: string;
    isUsernameInputEnabled: boolean;
    isPasswordInputEnabled: boolean;
    isSubmitButtonEnabled: boolean;
}

interface LoginBodyData {
    username: string;
    password: string;
}

interface LoginSuccessJSONResponse {
    data: {
        user: User,
        authorization: {
            access_token: string,
            refresh_token: string
        }
    };
}

interface LoginFailJSONResponse {
    detail: {
        errors: Array<APIError>
    }
}

function Login(): React.ReactNode {
    const [formData, setFormData] = useState<LoginFormState>({
        username: '',
        password: '',
        isUsernameInputEnabled: true,
        isPasswordInputEnabled: true,
        isSubmitButtonEnabled: true
    });

    // Based on:
    // - https://www.w3schools.com/react/react_forms.asp
    function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const name: string = event.target.name;
        const value: string = event.target.value;
        setFormData((values: LoginFormState): LoginFormState => ({
            ...values,
            [name]: value
        }));
    }

    async function handleLogin(event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>): Promise<boolean> {
        event.preventDefault();

        if (formData.username === '' || formData.password === '') {
            return false;
        }

        const bodyData: LoginBodyData = {
            username: formData.username,
            password: formData.password
        };
        setFormData((data: LoginFormState): LoginFormState => ({
            ...data,
            isUsernameInputEnabled: false,
            isPasswordInputEnabled: false,
            isSubmitButtonEnabled: false,
            errorMessage: undefined
        }));

        const response: Response = await post('/login', bodyData);
        if (response.ok) {
            const {data}: LoginSuccessJSONResponse = await response.json();
            localStorage.setItem(ACCESS_TOKEN_STORAGE_NAME, data.authorization.access_token);
            localStorage.setItem(REFRESH_TOKEN_STORAGE_NAME, data.authorization.refresh_token);

            // Reload so that we can change the page displayed easily.
            window.location.reload();
            return false;
        } else {
            const {detail}: LoginFailJSONResponse = await response.json();

            // We already know that there is one error that is returned.
            if (detail.errors[0].code === 'wrong_credentials') {
                setFormData((data: LoginFormState): LoginFormState => ({
                    ...data,
                    errorMessage: 'Wrong username or password.'
                }));
            }

            setFormData((data: LoginFormState): LoginFormState => ({
                ...data,
                isUsernameInputEnabled: true,
                isPasswordInputEnabled: true,
                isSubmitButtonEnabled: true
            }));
        }

        return false;
    }

    return (
        <div className='form-container'>
            <h1>Login</h1>
            <form className='login' onSubmit={handleLogin}>
                <FormMessage type={FormMessageType.Error}
                             message={formData.errorMessage}/>
                <div className='form-group'>
                    <label htmlFor='username'>Username</label>
                    <input type='text' placeholder='Username' name='username'
                           onChange={handleChange}
                           disabled={!formData.isUsernameInputEnabled}
                           required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password</label>
                    <input type='password' placeholder='Password'
                           name='password'
                           onChange={handleChange}
                           disabled={!formData.isUsernameInputEnabled}
                           required/>
                </div>
                <button type='submit'
                        disabled={!formData.isUsernameInputEnabled}>Login
                </button>
            </form>
        </div>
    )
}

export default Login;
