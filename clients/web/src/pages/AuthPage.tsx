import * as React from 'react';
import {useState} from 'react';
import {Login, Registration} from '../components.tsx';
import './AuthPage.css';

enum ActiveForm {
    LOGIN,
    REGISTRATION
}

function AuthPage(): React.ReactNode {
    const [activeForm, setActiveForm] = useState<ActiveForm>(ActiveForm.LOGIN);

    function switchForm() {
        if (activeForm == ActiveForm.LOGIN) {
            setActiveForm(ActiveForm.REGISTRATION);
        } else {
            setActiveForm(ActiveForm.LOGIN);
        }
    }

    return (
        <section className='container full-page centered'>
            {activeForm == ActiveForm.LOGIN ? <Login/> : <Registration/>}
            {activeForm == ActiveForm.LOGIN
                ? <p>No account? <a href='javascript:void(0)'
                                    onClick={switchForm}>Create an account.</a>
                </p>
                : <p>Already have an account? <a href='javascript:void(0)'
                                                 onClick={switchForm}>Log
                    in.</a></p>
            }
        </section>
    );
}

export default AuthPage;
