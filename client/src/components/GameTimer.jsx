import { ProgressBar } from 'react-bootstrap';

function GameTimer({ currentTime, maxTime = 30 }) {
    return (
        <ProgressBar
            now={currentTime}
            max={maxTime}
            label={`${currentTime}s`}
            variant={currentTime > 10 ? "warning" : "danger"}
            className="mb-4"
            style={{ height: "30px" }}
            animated
        />
    );
}

export default GameTimer;
