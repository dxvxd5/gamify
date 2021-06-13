const SpotifyApi = {
  clientID: process.env.REACT_APP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  scopes: process.env.REACT_APP_SCOPE,
  redirectUri: process.env.REACT_APP_REDIRECT_URI,
  accessTokenUri: process.env.REACT_APP_ACCESS_TOKEN_URI,
  apiBaseUri: process.env.REACT_APP_API_BASE_URI,

  // Get the spotify authentification URI
  getAuthUri() {
    const queryString = new URLSearchParams({
      client_id: SpotifyApi.clientID,
      response_type: 'code',
      redirect_uri: encodeURI(SpotifyApi.redirectUri),
      scope: encodeURI(SpotifyApi.scopes),
    });
    const url = `${
      process.env.REACT_APP_AUTHORIZATION_URI
    }?${queryString.toString()}`;

    return url.toString();
  },

  // This function makes the API call an return the results
  // Request must be a Request object like in getAccessToken
  apiCall(request) {
    return fetch(request)
      .then((response) => {
        if (!response.ok) {
          throw response.statusText;
        } else {
          return response;
        }
      })
      .then((response) => response.json())
      .catch((err) => {
        throw err;
      });
  },

  // retrieve access token, refresh token and other info
  // return an object:
  //   {
  //     "access_token": ...,
  //     "token_type": ...,
  //     "scope": ...,
  //     "expires_in": ...,
  //     "refresh_token": ...
  //  }
  // Because it is an async method, it return always a promise.
  getAccessToken(authCode) {
    if (!authCode) {
      throw new Error('No authentification code available');
    }
    // setting up the POST request to retrieve the access token
    const requestParams = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: SpotifyApi.redirectUri,
        client_id: SpotifyApi.clientID,
        client_secret: SpotifyApi.clientSecret,
      }),
    };
    const request = new Request(SpotifyApi.accessTokenUri, requestParams);
    return SpotifyApi.apiCall(request);
  },

  refreshAccessToken(refreshToken) {
    // Take the refresh token and get a refreshed access token
    const requestParams = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: SpotifyApi.clientID,
        client_secret: SpotifyApi.clientSecret,
      }),
    };
    const request = new Request(SpotifyApi.accessTokenUri, requestParams);
    return SpotifyApi.apiCall(request);
  },

  getUserProfile(accessToken) {
    const requestParams = {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    };
    const request = new Request(`${SpotifyApi.apiBaseUri}/me`, requestParams);
    return SpotifyApi.apiCall(request);
  },

  randomNum(min = 0, max = 900) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  getRandomSearch() {
    // A list of all characters that can be chosen.
    const characters = 'aeiy'; // 'abcdefghijklmnopqrstuvwxyz';

    // Gets a random character from the characters string.
    const randomCharacter = characters.charAt(
      Math.floor(Math.random() * characters.length)
    );

    return `%25${randomCharacter}%25`;
  },

  questionsAPICall(params, accessToken) {
    const requestParams = {
      method: 'GET',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      }),
    };
    const request = new Request(
      `https://api.spotify.com/v1/search?${params}`,
      requestParams
    );
    return SpotifyApi.apiCall(request);
  },

  getSongWithPreviewIdx(songList) {
    // Return the index of the first song in the song list that has a preview url
    // Return undefined if no preview in the song list
    return songList.findIndex((song) => !!song.preview_url);
  },

  buildSongSearchParams(nrSong) {
    const searchString = SpotifyApi.getRandomSearch(); // d%25?
    const offset = SpotifyApi.randomNum();
    // %20year:1990-2020
    return `q=${searchString}&type=track&market=US&limit=${nrSong}&offset=${offset}`;
  },

  getSongs(accessToken, nrSong) {
    // This function get nrSong from spotify API
    const searchParams = SpotifyApi.buildSongSearchParams(nrSong);
    return SpotifyApi.questionsAPICall(searchParams, accessToken)
      .then((response) => {
        return response.tracks.items;
      })
      .catch((err) => {
        throw err;
      });
  },

  async buildSongListWithPreview(accessToken) {
    // Build a list of 4 songs from spotify while making sure that at least one of them has a
    // preview url so we can play it on the browser.

    let songList = [];
    let songWithPreviewIdx = -1;

    while (songWithPreviewIdx === -1) {
      // While there is no song with preview url
      // We get 10 songs to have more chance to get a song with a preview
      // eslint-disable-next-line no-await-in-loop
      songList = await SpotifyApi.getSongs(accessToken, 10);
      songWithPreviewIdx = SpotifyApi.getSongWithPreviewIdx(songList);
    }

    // Out of the while loop, songList contains at least one song with a preview
    // which index is songWithPreviewIdx
    // But we need to return four songs
    const i = songWithPreviewIdx >= 5 ? 0 : 5;
    return [
      // The song with the preview is always the first
      songList[songWithPreviewIdx],
      songList[i],
      songList[i + 1],
      songList[i + 2],
    ];
  },
};

export default SpotifyApi;
