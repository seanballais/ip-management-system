import {createRoot} from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    // Ideally, we should be in strict mode. However, our deadline tells us to
    // disable it for now.
    <>
        <App/>
    </>,
)
