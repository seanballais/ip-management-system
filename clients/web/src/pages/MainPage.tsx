import * as React from 'react';
import LogoutLink from "../components/LogoutLink/LogoutLink.tsx";
import {ACCESS_TOKEN_STORAGE_NAME} from "../utils/api.ts";
import UserData from "../interfaces/UserData.ts";
import {getUserDataFromToken} from "../utils/tokens.ts";

function MainPage(): React.ReactNode {
    const accessToken: string = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME) ?? '';
    const userData: UserData = getUserDataFromToken(accessToken);

    return (
        <>
            <header className='container'>
                <div className='row'>
                    <div className='column'>
                        <p className='bold'>👋 Hey, @{userData.username}!</p>
                    </div>
                    <nav className='column align-right'>
                        <LogoutLink/>
                    </nav>
                </div>
            </header>
            <h1>Never Gonna Give You Up</h1>
            <p>
                We're no strangers to love<br/>
                You know the rules and so do I<br/>
                A full commitment's what I'm thinkin' of<br/>
                You wouldn't get this from any other guy
            </p>
        </>
    );
}

export default MainPage;
