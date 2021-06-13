import React from 'react';
import PropTypes from 'prop-types';
import ChoiceButtonView from '../choiceButton/choiceButtonView';
import QuestionView from './questionView';
import TimerPresenter from './timerPresenter';
import SongPlayer from './songPlayer';
import '../../../assets/css/global.css';
import nyc from '../../../assets/audio/nyc.mp3';

function QuestionPresenter(props) {
  const [buttonState, setButtonState] = React.useState(false);
  const [isCurrChoiceCorrect, setIsCurrChoiceCorrect] = React.useState(false);
  const [currChoice, setCurrChoice] = React.useState(-1);
  const { nextQuestion, question, model, currQuestionNum } = props;
  const [currMoves, setCurrMoves] = React.useState(model.moves);

  function update() {
    if (buttonState && isCurrChoiceCorrect) {
      model.setScore(5);
      // Put the isCurrChoiceCorrect state back to false
      setIsCurrChoiceCorrect(false);
    } else if (!buttonState) {
      setCurrChoice(-1);
      model.setMove(-1);
    }
  }

  React.useEffect(function () {
    function obs(_, message) {
      if (message.type === 'all_moves' || message.type === 'move') {
        setCurrMoves(model.moves);
      }
    }
    model.addObserver(obs);
  }, []);

  React.useEffect(
    function () {
      update();
    },
    [buttonState]
  );

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
          <source src={nyc} type="audio/mp3" />
          <track kind="captions" />
        </audio>
      )}
      <TimerPresenter
        showAnswer={(flag) => setButtonState(flag)}
        showNextQ={() => nextQuestion()}
        isChoiceCorrect={isCurrChoiceCorrect}
      />
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
      <div className="choose-area">
        {question.choices.map((choice, choiceID) => (
          <ChoiceButtonView
            // eslint-disable-next-line react/no-array-index-key
            key={choiceID}
            id={choice.ID}
            onclick={() => {
              if (!buttonState) {
                setIsCurrChoiceCorrect(choice.right);
                setCurrChoice(choiceID);
                model.setMove(choiceID);
              }
            }}
            move={
              buttonState
                ? Object.entries(currMoves)
                    .filter((player) => player[1] === choiceID)
                    .map((player) => player[0])
                : ''
            }
            buttonstate={buttonState.toString()}
            choice={choice.c}
            clicked={(currChoice === choiceID).toString()}
            revealresponse={(buttonState && choice.right).toString()}
          />
        ))}
      </div>
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
