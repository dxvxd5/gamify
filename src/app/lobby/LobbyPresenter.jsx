import React from 'react';
import LobbyView from './LobbyView';
import LoadingView from '../reusable_components/loadingView';

export default function lobbyPresenter({ model }) {
  const [cardsState, setCardState] = React.useState(null);
  const [state, setState] = React.useState(model.gameStarted);
  const [roomPlayers, setRoomPlayers] = React.useState(model.roomPlayers);
  const [questions, setQuestions] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [roomName, setRoomName] = React.useState(model.roomName);
  const [gameType, setGameType] = React.useState(model.gameType);

  React.useEffect(function () {
    function obs(_, message) {
      if (message.type === 'game' || message.type === 'game_started') {
        setState(model.gameStarted);
      } else if (message.type === 'players') {
        setRoomPlayers(model.roomPlayers);
      } else if (message.type === 'questions') {
        setQuestions(model.gameQuestions);
      } else if (message.type === 'room_name') {
        setRoomName(model.roomName);
      } else if (message.type === 'gameType') {
        setGameType(model.gameType);
      }
    }
    model.addObserver(obs);
    return function () {
      model.removeObserver(obs);
    };
  }, []);
  React.useEffect(
    function () {
      if (state === 'start') {
        if (questions && gameType) {
          window.location.hash = '#game';
        } else {
          setLoading(true);
        }
      } else if (state === 'remove') {
        model.leaveRoom();
        window.location.hash = '#homepage';
      }
    },
    [questions, state, gameType]
  );

  return (
    <div>
      {loading ? (
        <LoadingView />
      ) : (
        <LobbyView
          roomID={model.roomID}
          roomName={roomName}
          activeCard={cardsState}
          onCardClick={(val) => setCardState(val)}
          players={roomPlayers}
          onStart={() => setState(model.startGame(cardsState))}
          onEnd={() => setState(model.leaveRoom())}
          isHost={model.isHost}
        />
      )}
    </div>
  );
}
