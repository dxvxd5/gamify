import React from 'react';
import PropTypes from 'prop-types';

// This component represents the current question during a quiz.
const QuestionView = (props) => {
  const { question, currQuestionNum, totalQuestionNum } = props;

  return (
    <div className="welcome-message">
      <span id="question_number">
        Question {currQuestionNum + 1} / {totalQuestionNum}
      </span>
      <span id="question">{question}</span>
    </div>
  );
};

QuestionView.propTypes = {
  question: PropTypes.string.isRequired,
  currQuestionNum: PropTypes.string.isRequired,
  totalQuestionNum: PropTypes.string.isRequired,
};

export default QuestionView;
