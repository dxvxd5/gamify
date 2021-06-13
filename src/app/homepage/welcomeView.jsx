/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import '../../assets/css/global.css';

const WelcomeView = ({ joinRoom, createRoom, name }) => {
  return (
    <div className="container" id="welcome-view">
      <div className="welcome-message">Welcome {name} !! 🤩</div>
      <div className="engaging-message">
        Connect with your friends !<br />
        Join or create a room !
      </div>
      <div className="choose-area">
        <button
          type="button"
          id="join-room"
          onClick={() => {
            joinRoom();
          }}
        >
          <span className="button-text">
            Join <br />
            Room!
          </span>
        </button>
        <button
          id="create-room"
          type="button"
          onClick={() => {
            createRoom();
          }}
        >
          <span className="button-text">
            Create <br /> Room!
          </span>
        </button>
      </div>
    </div>
  );
};

WelcomeView.propTypes = {
  joinRoom: PropTypes.func.isRequired,
  createRoom: PropTypes.func.isRequired,
  name: PropTypes.string,
};

WelcomeView.defaultProps = {
  name: '',
};

export default WelcomeView;
