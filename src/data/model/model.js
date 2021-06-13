import Opentriviadb from '../../api/opentriviadb/opentriviadb';
import SpotifyApi from '../../api/spotify/spotify';
import Message from './message';
import defaultProfilePic from '../../assets/images/happyface.png';
import { isRoom } from '../firebase/firebase';
import utils from './utils';

class GamifyModel {
  constructor() {
    this.observers = [];
    // Spotify ID of the user
    this.userID = null;
    this.name = null;
    this.photo = null;
    // Access token to the spotify account to the user
    // Need to be refreshed
    this.accessToken = null;
    // The refreshToken used to refresh the accessToken
    this.refreshToken = null;
    this.oldRoom = null;
    this.gameStarted = 'end';
    this.roomPlayers = null;
    this.moves = null;
    this.roomID = null;
    this.roomName = null;
    this.isHost = false;
    this.score = null;
    this.gameQuestions = null;

    // Need this for firebase persistence to work correctly
    this.oldRoomID = null;
  }

  setProfileError(error) {
    // The error that can occur when setting the user information
    // after user has logged in
    this.profileError = error;
    this.notifyObservers(new Message('user_info_error'));
  }

  setHashTag(hashtag) {
    this.hashTag = hashtag;
    this.notifyObservers(new Message('hash_change'));
  }

  setUserInfoFromCode(code) {
    // Very first function to call after initialization of the model
    // Takes the authentification code from spotify and set the user
    // informations from spotify in the model including the tokens
    SpotifyApi.getAccessToken(code)
      .then((obj) => {
        this.accessToken = obj.access_token;
        this.refreshToken = obj.refresh_token;
      })
      .then(() => SpotifyApi.getUserProfile(this.accessToken))
      .then((profile) => {
        this.name = profile.display_name;
        this.userID = profile.id;
        if (profile.images && profile.images.length > 0) {
          this.photo = profile.images[0].url;
        } else {
          this.photo = defaultProfilePic;
        }
      })
      .then(() => {
        // We set the access token in the local storage for persistence
        window.localStorage.setItem('userID', this.userID);

        // the value of the message is "upload" because this is function
        // when the user login in app. Which means that we need to
        // upload the infos to firebase
        this.notifyObservers(new Message('user_info', 'upload'));
      })
      .catch((err) => this.setProfileError(err));
  }

  setUserInfo(name, photo, refreshToken) {
    // This function is called when we get back the user info
    // from firebase after a user reload the page
    // At this point the access token may have expired so we refresh it

    SpotifyApi.refreshAccessToken(refreshToken)
      .then((obj) => {
        this.accessToken = obj.access_token;
        this.refreshToken = refreshToken;
        this.photo = photo;
        this.name = name;
        this.notifyObservers(new Message('user_info'));
      })
      .catch((err) => this.setProfileError(err));
  }

  // when adding a user to a room, we set its room ID
  // The user can only be in one room at a time
  // ! Never use this function directly.
  // ! Use either joinRoom or leaveRoom
  setRoomID(roomID, reinit = false) {
    if (!reinit && this.roomID) {
      throw new Error('User is already in a room');
    }

    // We keep the old roomID if any so that we can stop listening
    // to the old room if necessary
    this.oldRoomID = this.roomID;
    this.roomID = roomID;

    // if reinit is true, we remove the room ID from the
    // local storage
    if (reinit) {
      window.localStorage.removeItem('roomID');
    } else {
      // Add the room ID in the local storage for persistence
      window.localStorage.setItem('roomID', this.roomID);
    }

    this.notifyObservers(new Message('room_id'));
  }

  setRoomPlayers(roomPlayers) {
    this.roomPlayers = roomPlayers;
    this.notifyObservers(new Message('players'));
  }

  setRoomName(roomName) {
    this.roomName = roomName;
    this.notifyObservers(new Message('room_name'));
  }

  // create a room
  createRoom(roomName) {
    // Since the spotify UserID is unique for all users
    // identifying the room with it is a good idea (thanks Chiachen)
    this.setRoomPlayers({
      // Add the room creator in the list of players in the room
      [this.userID]: {
        name: this.name,
        photo: this.photo,
        host: true,
      },
    });
    this.isHost = true;
    this.gameStarted = 'wait';
    this.setRoomID(this.userID);
    this.setRoomName(roomName);
    this.notifyObservers(new Message('room', 'create'));
  }

  joinRoom(roomID) {
    this.setRoomPlayers({
      [this.userID]: {
        name: this.name,
        photo: this.photo,
        host: false,
      },
    });
    this.isHost = false;
    this.gameStarted = 'wait';
    this.setRoomID(roomID);
    this.notifyObservers(new Message('room', 'join'));
  }

  // when a user quit a room, remove his roomID
  leaveRoom() {
    this.reinitialize();
  }

  // Must return a then-able object
  // eslint-disable-next-line class-methods-use-this
  retrieveQuestions(gameType, nrOfQuestions) {
    // 1: quiz game
    if (gameType === 1) {
      return Opentriviadb.getQuestions(nrOfQuestions);
    }
    if (gameType === 2) {
      let questions = [];
      for (let i = 0; i < nrOfQuestions; i += 1) {
        questions = [
          ...questions,
          SpotifyApi.buildSongListWithPreview(this.accessToken),
        ];
      }
      return Promise.all(questions);
    }
    return null;
  }

  setQuestions(questions) {
    this.gameQuestions = questions;
    this.notifyObservers(new Message('questions'));
  }

  setGameType(gameType) {
    this.gameType = gameType;
    this.notifyObservers(new Message('gameType'));
  }

  setScore(score, init = false) {
    if (init) {
      // When initializing the game, set the score
      // to zero for everyone.
      this.score = Object.fromEntries(
        Object.keys(this.roomPlayers).map((playerID) => [playerID, 0])
      );
      this.notifyObservers(new Message('score', 'init'));
    } else {
      this.score[this.userID] += score;
      this.notifyObservers(new Message('score'));
    }
  }

  setAllScores(score) {
    this.score = score;
    this.notifyObservers(new Message('all_scores'));
  }

  startGame(gameType, nrOfQuestions = 10) {
    if (this.gameStarted === 'start') {
      throw new Error('A game has already started');
    }
    this.retrieveQuestions(gameType, nrOfQuestions)
      .then((questions) => {
        // this.gameQuestions = processTriviaQuestions(questions);
        // this.notifyObservers(new Message('questions'));
        if (gameType === 1) {
          this.setQuestions(utils.processTriviaQuestions(questions));
        } else if (gameType === 2) {
          this.setQuestions(utils.processSpotifyQuestions(questions));
        }
        this.currentGameQuestion = 0;
        this.setScore('', true); // initialize the scores
        this.setMove('', true); // initialize the moves
        this.gameStarted = 'start';
        this.setGameType(gameType);
        this.notifyObservers(new Message('game', 'start'));
      })
      .catch((error) => {
        this.startGameError = error;
        this.notifyObservers(new Message('start_game_error'));
      });
  }

  endGame() {
    this.gameStarted = 'wait';
    this.currentGameQuestion = null;
    this.gameQuestions = null;
    this.notifyObservers(new Message('game', 'end'));
  }

  setMove(move, init = false) {
    if (init) {
      this.moves = Object.fromEntries(
        Object.keys(this.roomPlayers).map((k) => [k, -1])
      );
      this.notifyObservers(new Message('move', 'init'));
    } else {
      this.moves[this.userID] = move;
      this.notifyObservers(new Message('move'));
    }
  }

  setAllMoves(moves) {
    this.moves = moves;
    this.notifyObservers(new Message('all_moves'));
  }

  setGameStarted(gameStarted) {
    this.gameStarted = gameStarted;
    this.notifyObservers(new Message('game_started'));
  }

  setCurrentGameQuestion(gameQuestion, download = false) {
    // To notify the observers if they should upload the game question or not
    const messageValue = download ? 'download' : 'upload';
    this.currentGameQuestion = gameQuestion;
    this.notifyObservers(new Message('current_game_question', messageValue));
  }

  reinitialize() {
    const host = this.isHost;
    this.isHost = false;
    this.oldRoom = this.roomID;
    this.gameQuestions = null;
    this.currentGameQuestion = 0;
    this.setRoomID(null, true);
    this.roomPlayers = null;
    this.score = null;
    this.moves = null;
    this.gameStarted = host ? 'remove' : null;
    this.notifyObservers(new Message('reinit', host ? 'host' : ''));
  }

  userLogout() {
    this.reinitialize();
    // When the user logout, we remove the clean the local storage
    window.localStorage.removeItem('userID');
    this.notifyObservers(new Message('logout'));
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken;
    this.notifyObservers(new Message('accessToken'));
  }

  setRefreshToken(refreshToken) {
    this.refreshToken = refreshToken;
    this.notifyObservers(new Message('refreshToken'));
  }

  // eslint-disable-next-line class-methods-use-this
  roomExists(roomID) {
    // if (!roomID) {
    //   throw new Error();
    // }
    return isRoom(roomID).then((r) => {
      if (r) {
        return true;
      }
      throw new Error('The room does not exist');
    });
  }

  // ========== Observers ==========
  addObserver(callback) {
    this.observers = [...this.observers, callback];
  }

  removeObserver(callback) {
    this.observers = this.observers.filter((item) => item !== callback);
  }

  notifyObservers(message) {
    // possible to add argument for informing why observers was informed.
    this.observers.forEach((cb) =>
      setTimeout(
        () => {
          try {
            cb(this, message);
          } catch (e) {
            /* catch e */
          }
        },
        message.type === 'questions' ? 5000 : 0
      )
    );
    // ====================================
  }
}

export default GamifyModel;
