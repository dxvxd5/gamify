import React from 'react';
import Show from './showPresenter';
import LoginPresenter from './login/loginPresenter';
import LobbyPresenter from './lobby/LobbyPresenter';
import SpotifyApi from '../api/spotify/spotify';
import GamifyModel from '../data/model/model';
import { persistModel } from '../data/firebase/firebase';
import WelcomePresenter from './homepage/welcomePresenter';
import GamePresenter from './reusable_components/game/gamePresenter';
import SidebarPresenter from './sidebar/sidebarPresenter';
import './gameInterface/gameInterface.css';
import RoutePresenter from './routePresenter';

const App = () => {
  const m = new GamifyModel();
  persistModel(m);
  return (
    <div id="appRoot">
      <RoutePresenter model={m} />
      <Show model={m} hashes={['#login']}>
        <LoginPresenter model={m} authorizationUrl={SpotifyApi.getAuthUri()} />
      </Show>
      <div id="gridWrapper">
        <Show model={m} hashes={['#homepage', '#game', '#lobby']}>
          <SidebarPresenter model={m} />
        </Show>
        <Show model={m} hashes={['#homepage']}>
          <WelcomePresenter model={m} />
        </Show>
        <Show model={m} hashes={['#game']}>
          <GamePresenter model={m} />
        </Show>
        <Show model={m} hashes={['#lobby']}>
          <LobbyPresenter model={m} />
        </Show>
      </div>
    </div>
  );
};

export default App;
