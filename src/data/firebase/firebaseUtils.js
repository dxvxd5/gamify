/* eslint no-param-reassign: ["error", { "props": false }] */

// The firebase folders name in the database
// Use to avoid typos

const fbFolders = {
  game: 'games',
  room: 'rooms',
  roomName: 'roomName',
  score: 'score',
  user: 'users',
  question: 'questions',
  type: 'type',
  currentGame: 'currentGame',
  name: 'name',
  host: 'host',
  gameStat: 'gameStarted',
  aTok: 'accessToken',
  rTok: 'refreshToken',
  move: 'moves',
  photo: 'photo',
  currQuestion: 'currentQuestion',
  gType: 'gameType',
};

// little helper function to check is a ref exists
async function refExists(ref) {
  // read the data at this reference
  let check = false;
  await ref.once('value').then((snapshot) => {
    // return if there is data at this reference
    if (snapshot.exists()) {
      check = true;
    }
  });
  return check;
}

async function roomExists(db, roomID) {
  if (roomID) {
    const roomRef = db.ref(`${fbFolders.room}/${roomID}`);
    if (await refExists(roomRef)) {
      return true;
    }
  }
  return false;
}

async function setUserInfo(db, md, userID) {
  // The purpose of this function is to set the user information
  // back in the model when the page is reloaded.
  // It listens to the info just once.

  // first check if this user exists in the database
  const userRef = db.ref(`${fbFolders.user}/${userID}`);
  if (!(await refExists(userRef))) {
    throw new Error(`User with ID ${userID} does not exist`);
  }

  let name;
  let photo;
  let refreshToken;

  await userRef.child(fbFolders.rTok).once('value', (dataSnapshot) => {
    refreshToken = dataSnapshot.val();
  });
  await userRef.child(fbFolders.name).once('value', (dataSnapshot) => {
    name = dataSnapshot.val();
  });
  await userRef.child(fbFolders.photo).once('value', (dataSnapshot) => {
    photo = dataSnapshot.val();
  });
  md.userID = userID;
  md.setUserInfo(name, photo, refreshToken);
}

async function listenToUserInfo(db, md, userID) {
  // first check if this user exists in the database
  const userRef = db.ref(`${fbFolders.user}/${userID}`);
  if (!(await refExists(userRef))) {
    throw new Error(`User with ID ${userID} does not exist`);
  }
  userRef.child(fbFolders.host).on('value', (dataSnapshot) => {
    md.isHost = dataSnapshot.val();
  });
  // userRef.child(fbFolders.aTok).on('value', (dataSnapshot) => {
  //   md.accessToken = dataSnapshot.val();
  // });
  userRef.child(fbFolders.room).on('value', (dataSnapshot) => {
    md.roomID = dataSnapshot.val();
  });
}

// Create a new user to the database.
// id is the spotify id of the user
async function createUser(db, userID, name, photo, aTok, rTok) {
  const userRef = db.ref(`${fbFolders.user}/${userID}`);

  // If the user does not exist, do create it
  if (!(await refExists(userRef))) {
    userRef.update({
      [fbFolders.name]: name,
      [fbFolders.photo]: photo,
    });
  }
  userRef.update({
    [fbFolders.aTok]: aTok,
    [fbFolders.rTok]: rTok,
  });
}

// update information in the user table. The information
// to update are in the object toUpdate
async function updateUser(db, userID, toUpdate) {
  const userRef = db.ref(`${fbFolders.user}/${userID}`);
  if (!(await refExists(userRef))) {
    throw new Error(`User with id ${userID} does not exist!`);
  }
  userRef.update(toUpdate);
}

// update information in the room table. The information
// to update are in the object toUpdate
// ! Only information other than score, game and user
// ! may be updated with this function
// ! To update other infos, use the specific functions below
async function updateRoom(db, roomID, toUpdate) {
  const roomRef = db.ref(`${fbFolders.room}/${roomID}`);
  if (!(await refExists(roomRef))) {
    throw new Error(`Room with ID ${roomID} does not exist`);
  }
  roomRef.update(toUpdate);
}

// Add a user to a room
async function upUserToRoom(db, userID, roomID, userPhoto, userName) {
  const roomRef = db.ref(`${fbFolders.room}/${roomID}`);
  if (!(await refExists(roomRef))) {
    throw new Error(`Room with ID ${roomID} does not exist`);
  }

  // check if a user does exist in the database
  const userRef = db.ref(`${fbFolders.user}/${userID}`);
  if (!(await refExists(userRef))) {
    throw new Error(`User with ID ${userID} does not exist`);
  }

  // updating the database
  // Both the room and user "tables" are updated
  roomRef
    .child(fbFolders.user)
    .update({
      [userID]: {
        [fbFolders.name]: userName,
        [fbFolders.photo]: userPhoto,
        // This function will be used by user to join a room.
        // Therefore they are not host
        [fbFolders.host]: false,
      },
    })
    // eslint-disable-next-line no-unused-vars
    .catch((err) => {
      throw new Error('User not added to the room');
    });

  userRef
    .update({ [fbFolders.room]: roomID })
    // eslint-disable-next-line no-unused-vars
    .catch((err) => {
      throw new Error('User not added to the room');
    });
}

async function rmUserFromRoom(db, roomID, userID) {
  const roomRef = db.ref(`${fbFolders.room}/${roomID}`);
  if (!(await refExists(roomRef))) {
    throw new Error(`Room with ID ${roomID} does not exist`);
  }

  roomRef.child(fbFolders.score).child(userID).remove();
  roomRef.child(fbFolders.user).child(userID).remove();
}

// Change state to remove if Host is leaving the room
async function changeState(db, roomID, value) {
  const roomRef = db.ref(`${fbFolders.room}/${roomID}`);
  if (!(await refExists(roomRef))) {
    throw new Error(`Room with ID ${roomID} does not exist`);
  }

  roomRef.update({ [fbFolders.gameStat]: value });
}

// Create a new room and add the specified user to it.
async function upRoom(db, userID, userPhoto, userName, roomName) {
  // first check if this user exists in the database
  const userRef = db.ref(`${fbFolders.user}/${userID}`);
  if (!(await refExists(userRef))) {
    throw new Error(`User with ID ${userID} does not exist`);
  }

  // This function is necessarily to called by the host
  // So the user will have the status host of the room

  // Create a room named with the userID
  db.ref(`${fbFolders.room}`)
    .child(userID)
    .set({
      [fbFolders.roomName]: roomName,
      [fbFolders.user]: {
        [userID]: {
          [fbFolders.name]: userName,
          [fbFolders.photo]: userPhoto,
          [fbFolders.host]: true,
        },
      },
    });

  // Add user to the room
  userRef.update({ [fbFolders.room]: userID });
}

// Create a game and add it to the specified room.
// "game" is an object with the following properties:
// type, question (object with all the questions and their associated responses)
// return the newly created game ID
async function upGame(db, roomID, game) {
  // check if the room exists
  const roomRef = db.ref(`${fbFolders.room}/${roomID}`);
  if (!(await refExists(roomRef))) {
    throw new Error(`Room with ID ${roomID} does not exist`);
  }

  // add the game to the room
  roomRef.child(fbFolders.game).set(game);
}

// update the score or the Move of the players of the room
// score is an object like this:
// {
//   p1ID: p1Score or p1Move
//   p2ID: p2Score or p2Move
//   ...
// }
// Where ID is the spotify id used to authenticate players
async function upScoreOrMove(db, roomID, toUpdate, scoreOrMove = 'score') {
  const roomRef = db.ref(`${fbFolders.room}/${roomID}`);
  // check if the room exists
  if (!(await refExists(roomRef))) {
    throw new Error(`Room with ID ${roomID} does not exist`);
  }

  // Verify that all the users in the score object exist in the database
  // and they are in the room
  Object.keys(toUpdate).forEach(async function (player) {
    const ok = await refExists(roomRef.child(fbFolders.user).child(player));
    if (!ok) {
      throw new Error(
        `User with ID ${player} is not in room with ID ${roomID}`
      );
    }
  });
  if (scoreOrMove === 'score') {
    roomRef.child(fbFolders.score).update(toUpdate);
  } else if (scoreOrMove === 'move') {
    roomRef.child(fbFolders.move).update(toUpdate);
  }
}

async function listenToRoom(db, roomID, md) {
  const roomRef = db.ref(`${fbFolders.room}/${roomID}`);
  if (!(await refExists(roomRef))) {
    throw new Error(`Room with ID ${roomID} does not exist`);
  }

  roomRef.child(fbFolders.user).on('value', (dataSnapshot) => {
    if (dataSnapshot.exists()) {
      md.setRoomPlayers(dataSnapshot.val());
    }
  });

  roomRef.child(fbFolders.score).on('value', (dataSnapshot) => {
    if (dataSnapshot.exists()) {
      md.setAllScores(dataSnapshot.val());
    }
  });

  roomRef.child(fbFolders.move).on('value', (dataSnapshot) => {
    if (dataSnapshot.exists()) {
      md.setAllMoves(dataSnapshot.val());
    }
  });

  if (!md.isHost) {
    roomRef.child(fbFolders.gameStat).on('value', (dataSnapshot) => {
      if (dataSnapshot.exists()) {
        md.setGameStarted(dataSnapshot.val());
      }
    });

    roomRef.child(fbFolders.game).on('value', (dataSnapshot) => {
      if (dataSnapshot.exists()) {
        md.setQuestions(dataSnapshot.val());
      }
    });

    roomRef.child(fbFolders.roomName).on('value', (dataSnapshot) => {
      if (dataSnapshot.exists()) {
        md.setRoomName(dataSnapshot.val());
      }
    });

    roomRef.child(fbFolders.gType).on('value', (dataSnapshot) => {
      if (dataSnapshot.exists()) {
        md.setGameType(dataSnapshot.val());
      }
    });
  }

  const userRef = db.ref(`${fbFolders.user}/${md.userID}`);
  if (!(await refExists(userRef))) {
    throw new Error(`User with ID ${md.userID} does not exist`);
  }
  userRef.child(fbFolders.currQuestion).on('value', (dataSnapshot) => {
    if (dataSnapshot.exists()) {
      // true means that we are downloading the value from firebase
      md.setCurrentGameQuestion(dataSnapshot.val(), true);
    }
  });
}

async function stopListeningToRoom(db, roomID) {
  if (!roomID) return;
  const roomRef = db.ref(`${fbFolders.room}/${roomID}`);
  // check if the room exists
  if (!(await refExists(roomRef))) {
    throw new Error(`Room with ID ${roomID} does not exist`);
  }
  roomRef.child(fbFolders.user).off();
  roomRef.child(fbFolders.score).off();
  roomRef.child(fbFolders.game).off();
  roomRef.child(fbFolders.currQuestion).off();
  roomRef.child(fbFolders.move).off();
  roomRef.child(fbFolders.gameStat).off();
}

export {
  fbFolders,
  roomExists,
  createUser,
  upUserToRoom,
  rmUserFromRoom,
  upRoom,
  changeState,
  upGame,
  upScoreOrMove,
  updateUser,
  updateRoom,
  setUserInfo,
  listenToUserInfo,
  listenToRoom,
  stopListeningToRoom,
};
