import React from 'react';
import VanillaTilt from 'vanilla-tilt';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import WelcomeView from './welcomeView';

const WelcomePresenter = function ({ model }) {
  const [name, setName] = React.useState(model.name);

  function joinRoomPopUp() {
    Swal.fire({
      title: 'Enter the Room ID',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      inputValidator: (value) =>
        value ? false : 'You need to enter a room ID',
      showCancelButton: true,
      confirmButtonText: 'Join Room',
      showLoaderOnConfirm: true,
      preConfirm: (roomIDTyped) => {
        return model
          .roomExists(roomIDTyped)
          .then(() => {
            model.joinRoom(roomIDTyped);
            window.location.hash = '#lobby';
          })
          .catch(() => {
            if (!roomIDTyped) {
              Swal.showValidationMessage('Please enter a room ID');
            } else {
              Swal.showValidationMessage(`No Room with ID: ${roomIDTyped}`);
            }
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  }

  function createRoomPopUp() {
    Swal.mixin({
      showCancelButton: true,
      progressSteps: ['I', 'II'],
    })
      .queue([
        {
          title: 'Room name',
          text: 'Give your room a name (be creative 😉).',
          input: 'text',
          confirmButtonText: 'Next &rarr;',
          inputValidator: (value) =>
            value ? false : 'You need to enter a room name',
        },
        {
          title: 'Room ID',
          text: 'This will be your room ID. Copy it and give to your friends!',
          input: 'text',
          inputValue: model.userID,
          confirmButtonText: 'Create Room!',
          inputValidator: (value) =>
            value === model.userID
              ? false
              : 'Please do not change the room ID. Try again!',
        },
      ])
      .then((result) => {
        if (result.value) {
          const roomName = result.value[0];
          model.createRoom(roomName);
          Swal.fire({
            title: `Room ${roomName} created`,
            text: 'Have fun!!! 🤩',
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
          });
          window.location.hash = '#lobby';
        }
      });
  }

  React.useEffect(function () {
    function obs(_, message) {
      if (message.type === 'user_info') {
        setName(model.name);
      }
    }
    model.addObserver(obs);
    return function () {
      model.removeObserver(obs);
    };
  }, []);

  React.useEffect(function () {
    VanillaTilt.init(
      document.querySelectorAll('#welcome-view .choose-area button'),
      {
        max: 25,
        speed: 400,
        scale: 1.1,
        glare: true,
      }
    );
  }, []);

  return (
    <WelcomeView
      joinRoom={() => joinRoomPopUp()}
      createRoom={() => createRoomPopUp()}
      name={name}
    />
  );
};

WelcomePresenter.propTypes = {
  model: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default WelcomePresenter;
