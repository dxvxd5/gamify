<h1 align="center">
  <img src="https://i.imgur.com/aqUMd1L.png"/><br/>
  Gamify
</h1>
<p align="center"> An online multi-player music quiz game meant to bring people together online through music 🎵😍 <br/> </p>

## How to use the app
The application is accessible [here](https://gamify-perso.web.app/#login). Players log in with their Spotify accounts. Once logged in, they can either create their own room or join an existing room. In a room, they can invite their friends to play one of two different music-related quiz games, one of which use the Spotify API to play audio tracks. The games are:
- Song guess: Here the user listen to a song and have to choose the correct title of it
- Quiz game: Here the user will respond to questions to test their general knowledge in music

## How to run the app locally
- [Create a new firebase project](https://codinglatte.com/posts/how-to/how-to-create-a-firebase-project/). Add a Realtime Database instance to this project and initialize it with the following value: 
```json
{
 "rooms": {"gamify":1},
 "users": {"gamify":1}
}
```
- [Add a new app](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/) to your [Spotify for developper dashboard](https://developer.spotify.com/dashboard/applications). Edit [the settings](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/) of this newly created app and add `http://localhost:3000/#login` as a redirect URI. 
- Download the app folder in the main branch
- On your computer open the terminal in the `gamify` folder
- Install the dependencies of the application by running `npm install` in the terminal
- Create a `.env` file in the `gamify` folder. Use your [Firebase project config](https://support.google.com/firebase/answer/7015592?hl=en#zippy=%2Cin-this-article) and [Spotify app settings](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/) to fill it in the following manner: 
```
# Replace XXXX with the values in your Firebase project config
REACT_APP_API_KEY="XXXX"
REACT_APP_AUTH_DOMAIN="XXXX"
REACT_APP_DB_URL="XXXX"
REACT_APP_PROJECT_ID="XXXX"
REACT_APP_STORAGE_BUCKET="XXXX"
REACT_APP_MESSAGING_SENDER_ID="XXXX"
REACT_APP_APP_ID="XXXX"
REACT_APP_MEASUREMENT_ID="XXXX"

# Replace the XXXX with the values in your Spotify app settings
REACT_APP_CLIENT_ID="XXXX"
REACT_APP_CLIENT_SECRET="XXXX"
REACT_APP_ACCESS_TOKEN_URI="https://accounts.spotify.com/api/token"
REACT_APP_AUTHORIZATION_URI="https://accounts.spotify.com/authorize"
REACT_APP_SCOPE="user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state"
REACT_APP_API_BASE_URI="https://api.spotify.com/v1"
REACT_APP_REDIRECT_URI="http://localhost:3000/#login"
```
- Run the application locally by executing the command `npm start`
- You can now access the application on your browser at `http://localhost:3000`
