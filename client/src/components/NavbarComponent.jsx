import { Container, Navbar, Button, Nav, Modal } from "react-bootstrap";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { API } from "../api.mjs"; 

function NavbarComponent() {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Verifica se c'è una partita in corso
    const isGameInProgress = location.pathname === '/game';

    // Gestione logout
    const handleLogoutClick = () => {
        if (isGameInProgress) {
            setShowLogoutModal(true);
        } else {
            handleLogout();
        }
    };

    const handleLogout = async () => {
        try {
            await API.logout();
            setUser(null);
            navigate('/');
            setShowLogoutModal(false);
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    return (
        <>
            <Navbar style={{ backgroundColor: "#000", width: "100vw" }}>
                <Container fluid className="d-flex justify-content-between align-items-center">
                    <Navbar.Brand 
                        className="fw-bold" 
                        style={{ 
                            fontSize: "2rem", 
                            color: "#FFD600",
                            cursor: isGameInProgress ? 'not-allowed' : 'pointer',
                            opacity: isGameInProgress ? 0.5 : 1
                        }}
                        onClick={() => !isGameInProgress && navigate('/')}
                    >
                        Stuff Happens
                    </Navbar.Brand>
                    <Nav className="d-flex align-items-center" style={{ gap: "1.5rem" }}>
                        {/* Home link - disabilitato durante il gioco */}
                        <div 
                            className={`nav-link fw-bold ${isGameInProgress ? 'disabled' : ''}`}
                            style={{ 
                                fontSize: "1.2rem", 
                                color: "#FFD600",
                                cursor: isGameInProgress ? 'not-allowed' : 'pointer',
                                opacity: isGameInProgress ? 0.5 : 1
                            }}
                            onClick={() => !isGameInProgress && navigate('/')}
                        >
                            Home
                        </div>

                        <div 
                            className={`nav-link fw-bold ${isGameInProgress ? 'disabled' : ''}`}
                            style={{ 
                                fontSize: "1.2rem", 
                                color: "#FFD600",
                                cursor: isGameInProgress ? 'not-allowed' : 'pointer',
                                opacity: isGameInProgress ? 0.5 : 1
                            }}
                            onClick={() => !isGameInProgress && navigate('/rules')}
                        >
                            Rules
                        </div>


                        
                        {/* Login/Logout buttons */}
                        {!user ? (
                            <Button
                                variant="light"
                                className="fw-bold px-4"
                                style={{ 
                                    fontSize: "1.1rem", 
                                    borderRadius: "25px", 
                                    color: "#FFD600", 
                                    backgroundColor: "#222", 
                                    border: "none"
                                }}
                                onClick={() => navigate('/login')}
                            >
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                Login
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="light"
                                    className="fw-bold px-4"
                                    style={{ 
                                        fontSize: "1.1rem", 
                                        borderRadius: "25px", 
                                        color: "#FFD600", 
                                        backgroundColor: "#222", 
                                        border: "none" 
                                    }}
                                    onClick={handleLogoutClick}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </Button>
                                <div 
                                    className="d-flex flex-column align-items-center ms-2"
                                    style={{ 
                                        opacity: isGameInProgress ? 0.5 : 1, 
                                        cursor: isGameInProgress ? 'not-allowed' : 'pointer' 
                                    }}
                                    onClick={() => !isGameInProgress && navigate('/profile')}
                                >
                                    <i className="bi bi-person-circle fs-3" style={{ color: "#FFD600" }}></i>
                                    <span style={{ color: "#FFD600" }} className="small">{user.username}</span>
                                </div>
                            </>
                        )}
                    </Nav>
                </Container>
            </Navbar>

            {/* Modal di logout */}
            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to logout? The current game will be lost.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="warning" onClick={handleLogout}>
                        Confirm Logout
                    </Button>
                </Modal.Footer>
            </Modal>

            <ErrorModal errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
        </>
    );
}

function ErrorModal({ errorMessage, setErrorMessage }) {
    const handleClose = () => setErrorMessage(null);

    return (
        <Modal show={errorMessage !== null} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>{errorMessage}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default NavbarComponent;
