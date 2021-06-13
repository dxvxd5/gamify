import React from 'react';
import PropTypes from 'prop-types';
import ResultsView from './resultsView';
import '../../assets/css/global.css';

export default function ResultsPresenter({ model }) {
  return (
    <ResultsView
      scores={model.score}
      players={model.roomPlayers}
      endGame={() => model.endGame()}
    />
  );
}

ResultsPresenter.propTypes = {
  model: PropTypes.shape(PropTypes.object).isRequired,
};
