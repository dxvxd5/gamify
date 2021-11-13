import React from 'react';
import PropTypes from 'prop-types';

export default function AnswerView({ isAnswerCorrect, reset }) {
  const timeoutRef = React.useRef(null);
  const threeSeconds = 3000;

  React.useEffect(() => {
    timeoutRef.current = setTimeout(() => reset(), threeSeconds);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="engaging-message">
      {isAnswerCorrect ? (
        <span id="correct_choice">Correct!</span>
      ) : (
        <span id="incorrect_choice">Wrong!</span>
      )}
    </div>
  );
}

AnswerView.propTypes = {
  isAnswerCorrect: PropTypes.bool.isRequired,
  reset: PropTypes.func.isRequired,
};
