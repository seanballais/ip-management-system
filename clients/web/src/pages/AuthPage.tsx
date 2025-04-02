import * as React from 'react';
import {useState} from 'react';
import {Login} from '../components.tsx';

enum ActiveForm {
    LOGIN,
    REGISTRATION
}

function AuthPage(): React.ReactNode {
    const [activeForm, setActiveForm] = useState<ActiveForm>(ActiveForm.LOGIN);

    return (
        <section className='container'>
            {activeForm == ActiveForm.LOGIN ? <Login/> : <h1>What?</h1>}
        </section>
    );
}

export default AuthPage;
