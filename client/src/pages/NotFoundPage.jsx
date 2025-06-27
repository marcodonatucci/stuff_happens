import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <>
            <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Row className="w-100 justify-content-center">
                    <Col md={8} className="text-center">
                        <h1 className="display-1" style={{ color: "#FFD600" }}>404</h1>
                        <h2 style={{ color: "#FFD600" }}>Page Not Found</h2>
                        <p className="mb-4" style={{ color: "#FFD600" }}>
                            Sorry, the page you are looking for does not exist.
                        </p>
                        <Button
                            variant="warning"
                            className="fw-bold"
                            style={{ color: "#000" }}
                            onClick={() => navigate('/')}
                        >
                            <i className="bi bi-house-door me-2"></i>
                            Go to Home
                        </Button>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default NotFoundPage;
