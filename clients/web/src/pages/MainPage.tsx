import * as React from 'react';
import LogoutLink from "../components/LogoutLink/LogoutLink.tsx";
import {ACCESS_TOKEN_STORAGE_NAME} from "../utils/api.ts";
import UserData from "../interfaces/UserData.ts";
import {getUserDataFromToken} from "../utils/tokens.ts";
import AuditLogPanel from "../components/AuditLog/AuditLogPanel.tsx";

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
            <section className='container'>
                <AuditLogPanel/>
            </section>
        </>
    );
}

export default MainPage;
