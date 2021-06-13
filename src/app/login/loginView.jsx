import React from 'react';
import PropTypes from 'prop-types';
import './login.css';
import rockhand from '../../assets/images/rockhand.png';

const LoginView = (props) => {
  const { click } = props;

  return (
    <div id="login-root">
      <div id="login-leftson" className="debug">
        <img src={rockhand} alt="rocking hand" />
      </div>
      <div id="login-rightson" className="debug">
        <h1 className="debug">Welcome to Gamify!</h1>
        <section className="debug">
          <p className="debug">
            Want <br /> to have <br /> <span>fun</span>?
          </p>
          <p className="debug">
            Have a <br /> <span>Spotify</span> <br /> account?
          </p>
        </section>
        <button onClick={() => click()} type="button" className="debug">
          Log In!
        </button>
      </div>
    </div>
  );
};

LoginView.propTypes = {
  // authorizationUrl: PropTypes.string.isRequired,
  click: PropTypes.func.isRequired,
};

export default LoginView;
