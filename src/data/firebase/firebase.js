// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import firebase from 'firebase/app';
// Add the Firebase services that you want to use
import 'firebase/database';
import Swal from 'sweetalert2';

import {
  fbFolders,
  roomExists,
  createUser,
  upUserToRoom,
  upRoom,
  upGame,
  upScoreOrMove,
  stopListeningToRoom,
  updateUser,
  updateRoom,
  listenToRoom,
  rmUserFromRoom,
  listenToUserInfo,
  changeState,
  setUserInfo,
} from './firebaseUtils';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// This function calls the appropriate persistence function
// in firebaseUtils according to the given message
function dispatch(model, message) {
  switch (message.type) {
    case 'room':
      // If the user was in another room before,stop listening
      // to the change in that room
      stopListeningToRoom(db, model.oldRoomID).then(() => {
        if (message.value === 'create') {
          upRoom(db, model.userID, model.photo, model.name, model.roomName)
            .then(() =>
              updateRoom(db, model.roomID, {
                [fbFolders.gameStat]: model.gameStarted,
              })
            )
            .then(listenToRoom(db, model.roomID, model));
        } else if (message.value === 'join') {
          upUserToRoom(
            db,
            model.userID,
            model.roomID,
            model.photo,
            model.name
          ).then(listenToRoom(db, model.roomID, model));
        }
        updateUser(db, model.userID, {
          [fbFolders.room]: model.roomID,
          [fbFolders.host]: model.isHost,
        });
      });

      break;

    case 'players':
      // ? Not sure if I will need to use this
      break;

    case 'score':
      if (message.value === 'init') {
        // Upload all the scores since it is initialization
        upScoreOrMove(db, model.roomID, model.score);
      } else {
        // upload the score of the local user only to avoid collisions
        upScoreOrMove(db, model.roomID, {
          [model.userID]: model.score[model.userID],
        });
      }
      break;

    case 'game':
      upGame(db, model.roomID, model.gameQuestions);
      updateRoom(db, model.roomID, {
        [fbFolders.gameStat]: model.gameStarted,
        [fbFolders.gType]: model.gameType,
      });
      break;

    case 'move':
      if (message.value === 'init') {
        upScoreOrMove(db, model.roomID, model.moves, 'move');
      } else {
        upScoreOrMove(
          db,
          model.roomID,
          {
            [model.userID]: model.moves[model.userID],
          },
          'move'
        );
      }
      break;

    case 'current_game_question':
      if (message.value === 'upload') {
        updateUser(db, model.userID, {
          [fbFolders.currQuestion]: model.currentGameQuestion,
        });
      }
      break;

    case 'reinit':
      // If the user was in another room before,stop listening
      // to the change in that room
      // and remove the player from the room
      if (model.oldRoomID) {
        stopListeningToRoom(db, model.oldRoomID).then(() => {
          if (message.value === 'host') {
            changeState(db, model.oldRoom, 'remove');
          }
        });
        rmUserFromRoom(db, model.oldRoomID, model.userID);
      } else if (!model.oldRoomID && message.value === 'host') {
        changeState(db, model.oldRoom, 'remove');
      }

      updateUser(db, model.userID, {
        [fbFolders.host]: model.isHost,
        [fbFolders.room]: model.roomID,
        [fbFolders.currQuestion]: model.currentGameQuestion,
      });
      break;

    case 'accessToken':
      updateUser(db, model.userID, { [fbFolders.aTok]: model.accessToken });
      break;

    case 'refreshToken':
      updateUser(db, model.userID, { [fbFolders.rTok]: model.refreshToken });
      break;

    // When logging in the user
    case 'user_info':
      if (message.value === 'upload') {
        createUser(
          db,
          model.userID,
          model.name,
          model.photo,
          model.accessToken,
          model.refreshToken
        ).then(() => listenToUserInfo(db, model, model.userID));
      }
      break;

    default:
      break;
  }
}

function isRoom(roomID) {
  return roomExists(db, roomID);
}

function persistModel(model) {
  // Check if there is a user ID in the local storage
  // If so, it means that this user have logged in at least once
  // in the current browser so we get his/her info back from firebase
  // using this user ID
  const userID = window.localStorage.getItem('userID');

  // If there is a roomID in the local storage it means that the user
  // was in a room before reloading so we get the infos in that room back.
  const roomID = window.localStorage.getItem('roomID');

  if (userID) {
    setUserInfo(db, model, userID).then(() => {
      // Now we listen to the change of the user info in firebase
      listenToUserInfo(db, model, userID);

      if (roomID) {
        model.setRoomID(roomID);
        // And we listen to room info
        listenToRoom(db, roomID, model);
      }
    });

    model.addObserver(dispatch);
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: false,
    });

    Toast.fire({
      icon: 'info',
      title: `Taking you back to where you left off`,
    });
  } else {
    model.addObserver(dispatch);
  }
}

export { persistModel, isRoom };
