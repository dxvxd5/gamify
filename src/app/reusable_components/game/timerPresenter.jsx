import React from 'react';
import PropTypes from 'prop-types';
import TimerView from './timerView';

function TimerPresenter({ showAnswer, showNextQ, isChoiceCorrect }) {
  const initialMinute = 0;
  const initialSeconds = 10;
  const [flag, setFlag] = React.useState(true);
  const [minutes, setMinutes] = React.useState(initialMinute);
  const [seconds, setSeconds] = React.useState(initialSeconds);
  const [correctChoice, setcorrectChoice] = React.useState(isChoiceCorrect);
  React.useEffect(() => {
    const myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          if (flag) {
            clearInterval(myInterval);
            showAnswer(flag);
            setSeconds(4);
            setFlag(false);
            setcorrectChoice(isChoiceCorrect);
          } else {
            clearInterval(myInterval);
            showAnswer(flag);
            setSeconds(10);
            showNextQ();
            setFlag(true);
            setcorrectChoice(false);
          }
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  return (
    <TimerView
      seconds={seconds}
      minutes={minutes}
      correct={correctChoice}
      flag={flag}
    />
  );
}

TimerPresenter.propTypes = {
  showAnswer: PropTypes.func.isRequired,
  showNextQ: PropTypes.func.isRequired,
  isChoiceCorrect: PropTypes.bool.isRequired,
};

export default TimerPresenter;
