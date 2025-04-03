import * as React from 'react';
import './Login.css';

function Login(): React.ReactNode {
    return (
        <div className='form-container'>
            <h1>Login</h1>
            <form className='login'>
                <div className='form-group'>
                    <label htmlFor='username'>Username</label>
                    <input type='text' placeholder='Username' name='username'
                           required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password</label>
                    <input type='text' placeholder='Password' name='password'
                           required/>
                </div>
                <button type='submit'>Login</button>
            </form>
        </div>
    )
}

export default Login;
