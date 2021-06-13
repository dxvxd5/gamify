const Opentriviadb = {
  apiCall(params) {
    const url = `https://opentdb.com/api.php?category=12&${params}`;
    return fetch(url, {
      method: 'GET',
    })
      .then((response) => {
        if (response.ok) return response;
        throw new Error(response.status);
      })
      .then((response) => response.json())
      .catch((err) => {
        throw err;
      });
  },
  getQuestions(nrOfQuestions) {
    const params = `&amount=${nrOfQuestions}&type=multiple&difficulty=easy`;
    return Opentriviadb.apiCall(params)
      .then((response) => response.results)
      .catch((err) => {
        throw err;
      });
  },
};

export default Opentriviadb;
