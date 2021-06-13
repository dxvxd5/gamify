import React from 'react';
import PropTypes from 'prop-types';

const Show = function (props) {
  const { hashes, model } = props;
  const [hash, setHash] = React.useState(model.hashTag);

  React.useEffect(function () {
    const hashListener = function (_, message) {
      if (message.type === 'hash_change') {
        setHash(model.hashTag);
      }
    };

    model.addObserver(hashListener);
    return function () {
      model.removeObserver(hashListener);
    };
  }, []);

  if (hashes.find((r) => r === hash)) {
    return props.children;
  }
  return null;
};

Show.propTypes = {
  hashes: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.element.isRequired,
};

export default Show;
