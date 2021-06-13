import React from 'react';
import PropTypes from 'prop-types';
import './sidebar.css';

function compareScores(a, b) {
  return b[1] - a[1];
}

const SidebarView = ({
  gameStarted,
  scores,
  profilePicture,
  name,
  players,
  isInRoom,
  leaveRoom,
  logout,
}) => {
  return (
    <div id="sidebar">
      <div className="user_info">
        <img
          height="100"
          src={profilePicture}
          className="profile_img"
          alt="cat"
        />
        <div className="player-name">{name}</div>
      </div>

      {isInRoom ? (
        <div
          onClick={() => {
            leaveRoom();
            window.location.hash = '#homepage';
          }}
          className="leave_button"
          role="button"
          tabIndex={0}
          onKeyPress={() => {}}
        >
          Leave the room
        </div>
      ) : (
        ''
      )}
      <div className="leaderboard">
        {gameStarted === 'start' ? (
          <div className="title">Current Scores</div>
        ) : (
          <></>
        )}
        {gameStarted === 'start' && scores ? (
          <table className="leaderboard">
            <tbody>
              {Object.entries(scores)
                .sort(compareScores)
                .map((p) => (
                  <tr key={p}>
                    <td>
                      <p className="name-score">
                        {players[p[0]].name}: {p[1]}pt
                      </p>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <></>
        )}
      </div>
      <div
        type="button"
        onClick={() => {
          logout();
          window.location.hash = '#login';
        }}
        className="logout_button"
        role="button"
        tabIndex={0}
        onKeyPress={() => {}}
      >
        Logout
      </div>
    </div>
  );
};

SidebarView.propTypes = {
  gameStarted: PropTypes.string,
  scores: PropTypes.objectOf(PropTypes.number),
  profilePicture: PropTypes.string,
  name: PropTypes.string,
  players: PropTypes.objectOf(PropTypes.object),
  isInRoom: PropTypes.bool.isRequired,
  leaveRoom: PropTypes.func.isRequired,
  logout: PropTypes.func,
};
SidebarView.defaultProps = {
  gameStarted: null,
  logout: undefined,
  scores: null,
  name: '',
  players: null,
  profilePicture: '',
};

export default SidebarView;
