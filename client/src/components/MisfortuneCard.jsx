import { Card, Badge } from 'react-bootstrap';

function MisfortuneCard({ 
    card, 
    showIndex = true, 
    badge = null, 
    roundNumber = null,
    className = ""
}) {
    return (
        <Card bg="dark" text="light" className={`h-100 position-relative ${className}`}>
            {/* Badge se presente */}
            {badge && (
                <Badge 
                    bg={badge.bg} 
                    text={badge.text}
                    className="position-absolute top-0 end-0 m-2"
                >
                    {badge.label}
                </Badge>
            )}

            {/* Immagine carta */}
            <Card.Img 
                variant="top" 
                src={card.image_url} 
                alt={card.name}
                style={{ height: "180px", objectFit: "cover" }}
            />

            {/* Contenuto carta */}
            <Card.Body>
                <Card.Title style={{ color: "#FFD600" }}>{card.name}</Card.Title>
                
                {/* Indici e tema */}
                {showIndex && (
                    <div className="d-flex justify-content-between align-items-center">
                        <Badge bg="info">Index: {card.misfortune_index}</Badge>
                        <Badge bg="secondary">{card.theme}</Badge>
                    </div>
                )}

                {/* Numero del round se presente */}
                {roundNumber !== null && (
                    <small className="text-muted d-block mt-2">
                        Round: {roundNumber}
                    </small>
                )}
            </Card.Body>
        </Card>
    );
}

export default MisfortuneCard;
