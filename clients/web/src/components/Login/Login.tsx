import * as React from 'react';
import {useState} from "react";
import './Login.css';

interface LoginFormData {
    username: string;
    password: string;
    errorMessage?: string;
}

function Login(): React.ReactNode {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: ''
    });

    // Based on:
    // - https://www.w3schools.com/react/react_forms.asp
    function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const name: string = event.target.name;
        const value: string = event.target.value;
        setFormData((values: LoginFormData): LoginFormData => ({
            ...values,
            [name]: value
        }));
    }

    return (
        <div className='form-container'>
            <h1>Login</h1>
            <form className='login'>
                <div className='form-group'>
                    <label htmlFor='username'>Username</label>
                    <input type='text' placeholder='Username' name='username'
                           onChange={handleChange}
                           required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password</label>
                    <input type='password' placeholder='Password'
                           name='password'
                           onChange={handleChange}
                           required/>
                </div>
                <button type='submit'>Login</button>
            </form>
        </div>
    )
}

export default Login;
