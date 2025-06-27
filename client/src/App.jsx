import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {Outlet, Route, Routes} from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext.jsx';
import { GameProvider } from './contexts/GameContext.jsx';
import NavbarComponent from "./components/NavbarComponent.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import GamePage from "./pages/GamePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import RulesPage from "./pages/RulesPage.jsx";  



function App() {

    return (
        <AuthProvider>
            <GameProvider>
                <Routes>
                    <Route path="/" element={
                        <>
                            <NavbarComponent />
                            <Outlet />
                        </>
                    }>
                        <Route index element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/game" element={<GamePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/result" element={<ResultPage />} />
                        <Route path="/rules" element={<RulesPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </GameProvider>
        </AuthProvider>
    );
}

export default App;
