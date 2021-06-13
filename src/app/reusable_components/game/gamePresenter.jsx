import React from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import QuestionPresenter from './questionPresenter';
import ResultsPresenter from '../../gameInterface/resultsPresenter';

function GamePresenter(props) {
  const { model } = props;
  const [state, setState] = React.useState(model.gameStarted);
  const [currQuestionIndex, setCurrQuestionIndex] = React.useState(
    model.currentGameQuestion
  );
  const [currQuestion, setCurrQuestion] = React.useState(
    model.gameQuestions
      ? model.gameQuestions[currQuestionIndex]
      : { gameQuestion: '', choices: [] }
  );
  const [showResult, setShowResults] = React.useState(false);

  React.useEffect(function () {
    function obs(_, message) {
      if (message.type === 'game_started') {
        setState(model.gameStarted);
      }
    }
    model.addObserver(obs);
    return function () {
      model.removeObserver(obs);
    };
  }, []);

  React.useEffect(
    function () {
      if (state === 'remove') {
        model.leaveRoom();
        window.location.hash = '#homepage';
        Swal.fire({
          title: 'Host ended the room',
          icon: 'warning',
        });
      }
    },
    [state]
  );

  React.useEffect(
    function () {
      if (currQuestionIndex < model.gameQuestions.length) {
        model.setCurrentGameQuestion(currQuestionIndex);
        setCurrQuestion(model.gameQuestions[currQuestionIndex]);
      } else {
        setShowResults(true);
        model.setCurrentGameQuestion(-1);
      }
    },
    [currQuestionIndex]
  );

  React.useEffect(() => {
    function obs(_, message) {
      if (message.type === 'current_game_question') {
        if (message.value === 'download') {
          setCurrQuestionIndex(model.currentGameQuestion);
        }
      }
    }
    model.addObserver(obs);
    return model.removeObserver(obs);
  }, []);

  function nextQuestion() {
    if (currQuestionIndex < model.gameQuestions.length) {
      setCurrQuestionIndex(currQuestionIndex + 1);
    }
  }

  return (
    <div>
      {!showResult ? (
        <QuestionPresenter
          model={model}
          nextQuestion={nextQuestion}
          question={currQuestion}
          updateScore={(score) => model.setScore(score)}
          currQuestionNum={currQuestionIndex}
        />
      ) : (
        <ResultsPresenter model={model} />
      )}
    </div>
  );
}

GamePresenter.propTypes = {
  model: PropTypes.shape({
    gameQuestions: PropTypes.arrayOf(PropTypes.object),
    setScore: PropTypes.func,
    score: PropTypes.objectOf(PropTypes.number),
    roomPlayers: PropTypes.shape({
      name: PropTypes.string,
      score: PropTypes.number,
    }),
    currentGameQuestion: PropTypes.number.isRequired,
    addObserver: PropTypes.func.isRequired,
    removeObserver: PropTypes.func.isRequired,
    setCurrentGameQuestion: PropTypes.func.isRequired,
    gameStarted: PropTypes.string.isRequired,
    leaveRoom: PropTypes.func.isRequired,
  }).isRequired,
};

export default GamePresenter;
