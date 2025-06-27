import { Button } from 'react-bootstrap';

function PositionButtons({ 
    sortedCards, 
    selectedPosition, 
    onPositionSelect,
    className = "" 
}) {
    if (!sortedCards || !sortedCards.length) return null;

    return (
        <div className={`d-flex flex-wrap justify-content-center gap-2 ${className}`}>
            {/* Button "Before all" */}
            <Button
                variant={selectedPosition === 0 ? "warning" : "outline-warning"}
                onClick={() => onPositionSelect(0)}
                type="button"
                aria-label="Place before all cards"
            >
                Before all
            </Button>
            
            {/* Buttons "Between cards" */}
            {sortedCards.map((card, idx) => {
                if (!card || idx >= sortedCards.length - 1) return null;
                const nextCard = sortedCards[idx + 1];
                if (!nextCard) return null;

                return (
                    <Button
                        key={`pos-${idx}`}
                        variant={selectedPosition === idx + 1 ? "warning" : "outline-warning"}
                        onClick={() => onPositionSelect(idx + 1)}
                        type="button"
                        aria-label={`Place between indices ${card.misfortune_index} and ${nextCard.misfortune_index}`}
                    >
                        Between {card.misfortune_index} and {nextCard.misfortune_index}
                    </Button>
                );
            })}

            {/* Button "After all" */}
            <Button
                variant={selectedPosition === sortedCards.length ? "warning" : "outline-warning"}
                onClick={() => onPositionSelect(sortedCards.length)}
                type="button"
                aria-label="Place after all cards"
            >
                After all
            </Button>
        </div>
    );
}

export default PositionButtons;
