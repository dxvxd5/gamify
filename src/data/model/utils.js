import he from 'he';

const utils = {
  /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */

  decodeHtml(str) {
    return he.decode(str);
  },

  // Remove the features in the title of a song.
  // For example: "stay with me (feat David Love is All)"
  // becomes "stay with me"
  removeFeatures(str) {
    const regex = /\(.*(with|feat)*\)/gm;
    return str.replaceAll(regex, '');
  },

  // De facto algorithm to efficiently shuffle finite sequences
  // https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
  fisherYatesShuffle(list) {
    const array = list;
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },

  // eslint-disable-next-line camelcase
  extractAndShuffle({ question, correct_answer, incorrect_answers }) {
    const correctChoice = [
      { c: utils.decodeHtml(correct_answer), right: true },
    ];
    const incorrectChoice = incorrect_answers.map((ans) => {
      return { c: utils.decodeHtml(ans), right: false };
    });
    const gameQuestion = utils.decodeHtml(question);

    const allChoices = [...incorrectChoice, ...correctChoice];
    return { gameQuestion, choices: utils.fisherYatesShuffle(allChoices) };
  },

  extractAndProcess(songs) {
    const correctChoice = [
      { c: utils.removeFeatures(songs[0].name), right: true },
    ];
    let incorrectChoice = songs
      .map((song) => {
        return { c: utils.removeFeatures(song.name), right: false };
      })
      .filter((song) => song.c !== correctChoice[0].c);

    // In case there is not enough choices
    // This should never happen in practice
    // But you never know
    const choiceReplacement = ['Ojuelegba', 'I love you', "You're beautiful"];
    for (let i = incorrectChoice.length; i < 3; i++) {
      incorrectChoice = [
        ...incorrectChoice,
        {
          c: choiceReplacement[i],
          right: false,
        },
      ];
    }

    const allChoices = [...incorrectChoice, ...correctChoice];

    return {
      gameQuestion: 'What is the title of this song?',
      choices: utils.fisherYatesShuffle(allChoices),
      uri: songs[0].preview_url,
    };
  },

  processTriviaQuestions(questionsIn) {
    return questionsIn.map((questionIn) => utils.extractAndShuffle(questionIn));
  },

  processSpotifyQuestions(songsIn) {
    return songsIn.map((songs) => utils.extractAndProcess(songs));
  },
};
export default utils;
