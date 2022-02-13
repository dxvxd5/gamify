import React from 'react';
import PropTypes from 'prop-types';
import QuestionView from './questionView';
import TimerPresenter from './timerPresenter';
import SongPlayer from './songPlayer';
import '../../../assets/css/global.css';
import quizSong from '../../../assets/audio/quiz_song.mp3';
import ChoicesView from './choicesView';
import AnswerView from './answerView';

function QuestionPresenter(props) {
  const { nextQuestion, question, model, currQuestionNum } = props;
  const [buttonState, setButtonState] = React.useState(false);

  const isCurrChoiceCorrect = React.useRef(false);

  function updateCurrChoice(isCorrect) {
    isCurrChoiceCorrect.current = isCorrect;
  }

  function next() {
    nextQuestion();
    setButtonState(false);
    updateCurrChoice(false);
  }

  return (
    <div className="container" id="question-view">
      <QuestionView
        question={question.gameQuestion}
        currQuestionNum={currQuestionNum}
        totalQuestionNum={model.gameQuestions.length}
      />
      {model.gameType === 2 ? (
        <div id="player">
          <SongPlayer uri={question.uri} />
        </div>
      ) : (
        <audio autoPlay controls style={{ display: 'none' }}>
          <source src={quizSong} type="audio/mp3" />
          <track kind="captions" />
        </audio>
      )}

      {buttonState ? (
        <AnswerView
          isAnswerCorrect={isCurrChoiceCorrect.current}
          reset={next}
        />
      ) : (
        <TimerPresenter
          showAnswer={(flag) => setButtonState(flag)}
          showNextQ={() => nextQuestion()}
          isChoiceCorrect={isCurrChoiceCorrect.current}
        />
      )}

      <button
        className="leaveButton"
        type="button"
        onClick={() => {
          model.leaveRoom();
          window.location.hash = '#homepage';
        }}
      >
        Leave Game
      </button>

      <ChoicesView
        question={question}
        model={model}
        buttonState={buttonState}
        updateCurrChoice={updateCurrChoice}
      />
    </div>
  );
}

QuestionPresenter.propTypes = {
  nextQuestion: PropTypes.func.isRequired,
  question: PropTypes.shape({
    gameQuestion: PropTypes.string,
    choices: PropTypes.arrayOf(PropTypes.object),
    uri: PropTypes.string,
  }).isRequired,
  model: PropTypes.shape(PropTypes.object).isRequired,
  currQuestionNum: PropTypes.string.isRequired,
};

export default QuestionPresenter;
