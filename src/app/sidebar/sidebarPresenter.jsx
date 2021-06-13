import React from 'react';
import PropTypes from 'prop-types';
import SidebarView from './sidebarView';

export default function SidebarPresenter({ model }) {
  const [currentScore, setCurrentScore] = React.useState(model.score);
  const [name, setName] = React.useState(model.name);
  const [photo, setPhoto] = React.useState(model.photo);
  const [players, setPlayers] = React.useState(model.roomPlayers);
  const [isInRoom, setIsInRoom] = React.useState(false);

  React.useEffect(function () {
    function obs(_, message) {
      if (message.type === 'score' || message.type === 'all_scores') {
        setCurrentScore(model.score);
      } else if (message.type === 'user_info') {
        setPhoto(model.photo);
        setName(model.name);
      } else if (message.type === 'players') {
        setPlayers(model.roomPlayers);
        setCurrentScore(model.score);
      } else if (
        message.type === 'room' ||
        message.type === 'room_id' ||
        message.type === 'room_name'
      ) {
        setPlayers(model.roomPlayers);
        if (model.roomID) {
          setIsInRoom(true);
        } else {
          setIsInRoom(false);
        }
      } else if (message.type === 'reinit') {
        setIsInRoom(false);
        setPlayers(null);
        setCurrentScore(null);
      }
    }
    model.addObserver(obs);
    return function () {
      model.removeObserver(obs);
    };
  }, []);
  return (
    <SidebarView
      gameStarted={model.gameStarted}
      scores={currentScore}
      profilePicture={photo}
      name={name}
      players={players}
      isInRoom={isInRoom}
      leaveRoom={() => model.leaveRoom()}
      logout={() => model.userLogout()}
    />
  );
}
SidebarPresenter.propTypes = {
  model: PropTypes.shape(PropTypes.object),
};

SidebarPresenter.defaultProps = {
  model: null,
};
