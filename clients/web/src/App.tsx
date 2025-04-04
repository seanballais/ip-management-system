import AuthPage from './pages/AuthPage.tsx';
import {ACCESS_TOKEN_STORAGE_NAME} from "./utils/tokens.ts";
import MainPage from "./pages/MainPage.tsx";

function App() {
    const accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_STORAGE_NAME);
    // const refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_STORAGE_NAME);

    if (accessToken) {
        return <MainPage/>
    } else {
        return (
            <AuthPage/>
        )
    }
}

export default App;
