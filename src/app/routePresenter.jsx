import React from 'react';

export default function RoutePresenter({ model }) {
  const [isLogin, setIsLogin] = React.useState(false);
  // eslint-disable-next-line no-unused-vars
  const [__, setHash] = React.useState(window.location.hash);
  const [isInRoom, setIsInRooom] = React.useState(false);
  const [isQuestionSet, setIsQuestionSet] = React.useState(false);
  const [isGameTypeSet, setIsGameTypeSet] = React.useState(false);

  React.useEffect(function () {
    const hashListener = function () {
      setHash(window.location.hash.toLowerCase());
    };
    window.addEventListener('hashchange', hashListener);
    return function () {
      window.removeEventListener('hashchange', hashListener);
    };
  }, []);

  React.useEffect(function () {
    function obs(_, message) {
      if (message.type === 'user_info') {
        setIsLogin(true);
      } else if (message.type === 'logout') {
        setIsLogin(false);
      } else if (
        message.type === 'room' ||
        message.type === 'reinit' ||
        message.type === 'room_id'
      ) {
        if (model.roomID) setIsInRooom(true);
        else {
          setIsInRooom(false);
          setIsGameTypeSet(false);
          setIsQuestionSet(false);
        }
      } else if (message.type === 'game') {
        if (message.value === 'wait' || message.value === 'end') {
          setIsQuestionSet(false);
          setIsGameTypeSet(false);
        }
      } else if (message.type === 'questions') {
        if (model.roomID) setIsInRooom(true);
        if (model.gameQuestions) setIsQuestionSet(true);
      } else if (message.type === 'gameType') {
        if (model.roomID) setIsInRooom(true);
        if (model.gameType) setIsGameTypeSet(true);
      }
    }
    model.addObserver(obs);
    return () => model.removeObserver(obs);
  }, []);

  function changeHash(hash) {
    model.setHashTag(hash);
    window.location.hash = hash;
  }

  if (isLogin) {
    if (isInRoom) {
      if (isGameTypeSet && isQuestionSet) {
        changeHash('#game');
      } else {
        changeHash('#lobby');
      }
    } else {
      changeHash('#homepage');
    }
  } else {
    changeHash('#login');
  }
  return null;
}
