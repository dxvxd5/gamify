import React from 'react';
import PropTypes from 'prop-types';

function SongPlayer(props) {
  // song uri
  const { uri } = props;

  React.useEffect(() => {
    const audioElement = new Audio(uri);
    audioElement.play();
    return () => audioElement.pause();
  }, [uri]);

  return null;
}

SongPlayer.propTypes = {
  uri: PropTypes.string.isRequired,
};

export default SongPlayer;
