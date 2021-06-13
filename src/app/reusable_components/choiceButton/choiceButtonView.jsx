import React from 'react';
import PropTypes from 'prop-types';
import '../game/gameView.css';
import './choiceButton.css';
import '../../../assets/css/global.css';

// This component represents the choice buttons in a game

export default function ChoiceButtonView({
  choice,
  onclick,
  revealresponse,
  clicked,
  buttonstate,

  // move,
}) {
  return (
    <button
      type="button"
      onClick={() => onclick()}
      revealresponse={revealresponse}
      clicked={clicked}
      showingresponse={buttonstate}
    >
      {choice}
    </button>
    // {/* <p>{move.toString()}</p> */}
  );
}
// choiceText is a string and is mandatory
ChoiceButtonView.propTypes = {
  choice: PropTypes.string.isRequired,
  onclick: PropTypes.func.isRequired,
  revealresponse: PropTypes.string.isRequired,
  clicked: PropTypes.string.isRequired,
  buttonstate: PropTypes.string.isRequired,
  // move: PropTypes.arrayOf(PropTypes.string),
};
