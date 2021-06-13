// This class represents the message sent from the
// model to the observers at each change

class Message {
  // private static attribute
  static #allowedTypes = {
    accessToken: true, // when setting a new access token
    refreshToken: true, // when setting a new refresh token
    room: true, // when setting a new room ID
    players: true, // when updating the list of players in the room
    score: true, // when updating only the score of the local user
    game: true, // when setting a new game
    move: true, // when updating only the move of the local user
    reinit: true, // when reinitializing everything (typically when the user leave a room)
    remove: true,
    questions: true, // when updating the questions
    all_moves: true, // When updating all the moves of the players
    all_scores: true, // When updating all the scores of the players
    game_started: true, // when updating the gameStarted property
    current_game_question: true, // when updating the current game question
    user_info: true, // when setting the user info. Happens only when the user logs in.
    room_name: true, // when setting the room name.
    hash_change: true, // when changing the hash
    gameType: true, // when setting the game type.
    logout: true, // when the user logs out.
    room_id: true, // when setting the user id of the user

    // error messages
    user_info_error: true, // when there is an error setting the user info
    start_game_error: true, // when there is an error starting a game
  };

  // A message has a type and a value, the type must be one of the
  // allowed types above.
  constructor(type, value = null) {
    Message.check(type, value);
    this.type = type;
    this.value = value;
  }

  static check(type) {
    if (!Message.#allowedTypes[type]) {
      throw new Error(`Invalid message type: ${type}`);
    }
  }
}

export default Message;
