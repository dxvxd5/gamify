import React from 'react';
import './game/gameView.css';

export default function LoadingView() {
  return (
    <div className="container" id="loading-view">
      <img
        className="loading-img"
        alt="loading"
        src="http://www.csc.kth.se/~cristi/loading.gif"
      />
      <div className="roomid-message">
        Loading... <br /> Click now anywhere on the screen to activate the music
      </div>
    </div>
  );
}
