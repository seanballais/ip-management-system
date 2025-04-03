import React from 'react';

function Registration(): React.ReactNode {
    return (
        <div className='form-container'>
            <h1>Register</h1>
            <form className='registration'>
                <div className='form-group'>
                    <label htmlFor='username'>Username</label>
                    <input type='text' placeholder='Username' name='username'
                           required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password</label>
                    <input type='text' placeholder='Password' name='password1'
                           required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Re-enter Password</label>
                    <input type='text' placeholder='Re-enter Password'
                           name='password2'
                           required/>
                </div>
                <button type='submit'>Register</button>
            </form>
        </div>
    )
}

export default Registration;
