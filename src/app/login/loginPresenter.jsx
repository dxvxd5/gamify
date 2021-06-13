import React from 'react';
import PropTypes from 'prop-types';
import VanillaTilt from 'vanilla-tilt';
import Swal from 'sweetalert2';
import LoginView from './loginView';

// Reference to the pop-up
let popUpObjectReference = null;

// Open the pop up window used to login
function openPopUp(url) {
  // If the pop-up does not exist, create it
  if (popUpObjectReference == null || popUpObjectReference.closed) {
    popUpObjectReference = window.open(
      url,
      'spotify-login-popup',
      'resizable,scrollbars,status'
    );
  } else {
    // If pop not closed, just bring it back to the top
    popUpObjectReference.focus();
  }
}

const LoginPresenter = function (props) {
  const { authorizationUrl, model } = props;
  const [error, setError] = React.useState(model.profileError);

  React.useEffect(function () {
    VanillaTilt.init(document.querySelectorAll('#login-leftson img'), {
      max: 25,
      speed: 400,
      scale: 1.1,
      glare: true,
      axis: 'y',
    });
  }, []);

  React.useEffect(function () {
    // subscribe to the profileError of the model
    // which happens when the login go wrong.
    function loginErrorObserver(_, message) {
      if (message.type === 'user_info_error') {
        setError(model.profileError);
      }
    }
    model.addObserver(loginErrorObserver);

    return function () {
      // Unsubscribe
      model.removeObserver(loginErrorObserver);
    };
  }, []);

  // When we are in the popup
  if (window.name === 'spotify-login-popup') {
    // extract the code and save into the sessionStorage of the opener
    const s = new URLSearchParams(window.location.search);
    const code = s.get('code');
    window.opener.sessionStorage.setItem('code', code);
    window.close();
  } else {
    // in the opener, when the code is stored, we use it
    // to set the access token in the model
    window.onstorage = () => {
      const code = window.sessionStorage.getItem('code');
      if (code) {
        window.sessionStorage.removeItem('code');
        model.setUserInfoFromCode(code);
        if (error) {
          Swal.fire({
            title: 'Login failed',
            text: 'Something wrong happened🙁. Please try again',
            icon: 'error',
            confirmButtonText: 'Cool',
          });
        } else {
          window.location.hash = '#homepage';
          Swal.fire({
            title: 'Welcome to Gamify!',
            text: 'Welcome to the gamify application! This is a quiz application that you can play with your friends inside a room. Join or create a room, choose a game and you are good to go!',
            icon: 'success',
            confirmButtonText: 'Cool',
          });
        }
      }
    };
  }

  return <LoginView click={() => openPopUp(`${authorizationUrl}#login`)} />;
};

LoginPresenter.propTypes = {
  authorizationUrl: PropTypes.string.isRequired,
  model: PropTypes.shape({
    addObserver: PropTypes.func.isRequired,
    removeObserver: PropTypes.func.isRequired,
    setUserInfoFromCode: PropTypes.func.isRequired,
    profileError: PropTypes.instanceOf(Error),
  }).isRequired,
};

export default LoginPresenter;
