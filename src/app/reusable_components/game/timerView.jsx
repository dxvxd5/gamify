import React from 'react';
import PropTypes from 'prop-types';
import './gameView.css';

// This component represents the current question during a quiz.
const TimerView = ({ seconds }) => {
  // const { seconds, minutes } = props;
  return (
    <div className="engaging-message">
      <span className="timer-view">
        {seconds < 10 ? `0${seconds}` : seconds}
      </span>
    </div>
  );
};

TimerView.propTypes = {
  seconds: PropTypes.number.isRequired,
};

export default TimerView;
