import * as React from 'react';
import LogoutLink from "../components/LogoutLink/LogoutLink.tsx";

function MainPage(): React.ReactNode {
    return (
        <>
            <h1>Never Gonna Give You Up</h1>
            <p>
                We're no strangers to love<br/>
                You know the rules and so do I<br/>
                A full commitment's what I'm thinkin' of<br/>
                You wouldn't get this from any other guy
            </p>
            <LogoutLink/>
        </>
    );
}

export default MainPage;
