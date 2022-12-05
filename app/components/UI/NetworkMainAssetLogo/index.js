import React from 'react';
import PropTypes from 'prop-types';
import { NetworksChainId } from '@metamask/controllers';
import { connect } from 'react-redux';
import TokenIcon from '../Swaps/components/TokenIcon';

function NetworkMainAssetLogo({ chainId, ticker, style, big, biggest }) {
  if (ticker === 'nxt') {
    return (
      <TokenIcon big={big} biggest={biggest} symbol={'NXT'} style={style} />
    );
  }
  if (ticker === 'eth') {
    return (
      <TokenIcon big={big} biggest={biggest} symbol={'ETHEREUM'} style={style} />
    );
  }
  return (
    <TokenIcon big={big} biggest={biggest} symbol={ticker} style={style} />
  );
}

const mapStateToProps = (state) => ({
  chainId: state.engine.backgroundState.NetworkController.provider.chainId,
  ticker: state.engine.backgroundState.NetworkController.provider.ticker,
});

NetworkMainAssetLogo.propTypes = {
  chainId: PropTypes.string,
  ticker: PropTypes.string,
  style: PropTypes.object,
  big: PropTypes.bool,
  biggest: PropTypes.bool,
};

export default connect(mapStateToProps)(NetworkMainAssetLogo);
