import React from 'react';
import Emoji from 'a11y-react-emoji'; // npm install --save a11y-react-emoji
import PropTypes from 'prop-types';
import './gameInterface.css';

function compareScores(a, b) {
  return b[1] - a[1];
}

// eslint-disable-next-line no-unused-vars
export default function ResultsView({ scores, players, endGame }) {
  let i = 0;
  const emojis = [
    '',
    <Emoji key="first" symbol="🥇" />,
    <Emoji key="second" symbol="🥈" />,
    <Emoji key="third" symbol="🥉" />,
    <Emoji key="last" symbol="🙈" />,
  ];
  return (
    <div>
      <div className="result-header-message">End of game!</div>
      <div className="result-message">
        {Object.entries(scores)
          .sort(compareScores)
          .map((player) => {
            if (i < 4) {
              i += 1;
            }
            return (
              <table key={player[1]}>
                <ul>
                  {players[player[0]].name} : {player[1]} {emojis[i]}
                </ul>
              </table>
            );
          })}
      </div>
      <button
        type="button"
        className="leaveButton"
        onClick={() => {
          endGame();
          window.location.hash = '#lobby';
        }}
      >
        Back to Lobby
      </button>
    </div>
  );
}

ResultsView.propTypes = {
  scores: PropTypes.objectOf(PropTypes.number).isRequired,
  players: PropTypes.objectOf(PropTypes.string).isRequired,
  endGame: PropTypes.func.isRequired,
};
