import React from 'react';
import PropTypes from 'prop-types';
import ChoiceButtonView from '../choiceButton/choiceButtonView';

export default function ChoicesView(props) {
  const { question, model, buttonState, updateCurrChoice } = props;

  const [isCurrChoiceCorrect, setIsCurrChoiceCorrect] = React.useState(false);
  const [currChoice, setCurrChoice] = React.useState(-1);
  const [currMoves, setCurrMoves] = React.useState(model.moves);

  React.useEffect(function () {
    function obs(_, message) {
      if (message.type === 'all_moves' || message.type === 'move') {
        setCurrMoves(model.moves);
      }
    }
    model.addObserver(obs);
  }, []);

  function updateCurrentChoice(isChoiceCorrect) {
    updateCurrChoice(isChoiceCorrect);
    setIsCurrChoiceCorrect(isChoiceCorrect);
  }

  React.useEffect(
    function () {
      if (buttonState && isCurrChoiceCorrect) {
        model.setScore(5);
        // Put the isCurrChoiceCorrect state back to false
        setIsCurrChoiceCorrect(false);
      } else if (!buttonState) {
        setCurrChoice(-1);
        model.setMove(-1);
      }
    },
    [buttonState]
  );
  return (
    <div className="choose-area">
      {question.choices.map((choice, choiceID) => (
        <ChoiceButtonView
          // eslint-disable-next-line react/no-array-index-key
          key={choiceID}
          id={choice.ID}
          onclick={() => {
            if (!buttonState) {
              updateCurrentChoice(choice.right);
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
  );
}

ChoicesView.propTypes = {
  question: PropTypes.shape({
    gameQuestion: PropTypes.string,
    choices: PropTypes.arrayOf(PropTypes.object),
    uri: PropTypes.string,
  }).isRequired,
  model: PropTypes.shape(PropTypes.object).isRequired,
  buttonState: PropTypes.bool.isRequired,
  updateCurrChoice: PropTypes.func.isRequired,
};
