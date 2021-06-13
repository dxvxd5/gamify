import React from 'react';
import PropTypes from 'prop-types';
import './gameView.css';

// This component represents the current question during a quiz.
const TimerView = ({ seconds, correct, flag }) => {
  // const { seconds, minutes } = props;
  if (flag) {
    return (
      <div className="engaging-message">
        <span className="timer-view">
          {seconds < 10 ? `0${seconds}` : seconds}
        </span>
      </div>
    );
    // eslint-disable-next-line no-else-return
  } else {
    return (
      <div className="engaging-message">
        {correct ? (
          <span id="correct_choice">Correct!</span>
        ) : (
          <span id="incorrect_choice">Wrong!</span>
        )}
      </div>
    );
  }
};

TimerView.propTypes = {
  seconds: PropTypes.number.isRequired,
  correct: PropTypes.bool.isRequired,
  flag: PropTypes.bool.isRequired,
};

export default TimerView;
