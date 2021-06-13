import React from 'react';
import PropTypes from 'prop-types';
import './lobby.css';
import '../../assets/css/global.css';
import Swal from 'sweetalert2';

/* joinView */
export default function lobbyView({
  roomName,
  activeCard,
  onCardClick,
  players,
  onStart,
  isHost,
  roomID,
}) {
  const cards = [
    {
      id: 1,
      titlePart1: 'Quiz',
      titlePart2: 'game',
      info: 'In this game, you will play a round off...',
      img: '',
      order: 0,
    },
    {
      id: 2,
      titlePart1: 'Song',
      titlePart2: 'Guess',
      info: 'In this game, you will play a round off...',
      img: '',
      order: 2,
    },
  ];
  function toggleCardStyle(id) {
    if (cards[id - 1].id === activeCard) {
      return 'card-select';
    }
    return 'card';
  }

  function copyToClipboard() {
    const input = document.body.appendChild(document.createElement('input'));
    input.value = roomID;
    input.focus();
    input.select();
    document.execCommand('copy');
    input.parentNode.removeChild(input);

    Swal.fire({
      toast: true,
      position: 'top-right',
      showConfirmButton: false,
      timer: 1500,
      icon: 'success',
      title: 'Room id copied',
    });
  }

  return (
    <div className="container" id="lobby-view">
      <div className="welcome-message">
        Welcome to the {roomName} room! <br />
        <div>
          <button
            id="copy_button"
            type="button"
            onClick={() => copyToClipboard()}
          >
            Copy roomID
          </button>
        </div>
      </div>

      <div className="engaging-message">
        Step 1: Choose a game <br />
        Step 2: Have fun!
      </div>
      <div className="choose-area">
        {cards.map((card) => (
          <button
            type="button"
            tabIndex={0}
            key={card.id}
            style={{ order: card.order }}
            className={toggleCardStyle(card.id)}
            onClick={() => {
              onCardClick(card.id);
            }}
          >
            {card.titlePart1} <br /> {card.titlePart2}
          </button>
        ))}
        <div id="waiting_message">
          {!isHost ? <p>Wait for the host to start the game</p> : ''}
          <button
            type="button"
            id="start-button"
            disabled={!isHost || activeCard === null}
            className="button"
            onClick={() => onStart()}
          >
            Play
          </button>
        </div>
      </div>
      <div id="player-row-container">
        <div className="message">Your friends are coming</div>
        {players ? (
          <div className="row">
            {Object.keys(players).map((player) => (
              <figure key={player}>
                <img
                  className="top_image"
                  src={players[player].photo}
                  alt={players[player].name}
                />
                <figcaption>
                  {players[player].name} <br />
                  <span className="focus">
                    {players[player].host ? 'host' : ''}
                  </span>{' '}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}

lobbyView.propTypes = {
  roomName: PropTypes.string,
  activeCard: PropTypes.number,
  players: PropTypes.objectOf(PropTypes.object).isRequired,
  onCardClick: PropTypes.func.isRequired,
  onStart: PropTypes.func.isRequired,
  isHost: PropTypes.bool.isRequired,
  roomID: PropTypes.string.isRequired,
};
lobbyView.defaultProps = {
  roomName: null,
};
