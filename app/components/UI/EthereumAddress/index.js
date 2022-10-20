import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';
import { formatAddress } from '../../../util/address';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../../styles/common';


/**
 * View that renders an ethereum address
 * or its ENS name when supports reverse lookup
 */
class EthereumAddress extends PureComponent {
  static propTypes = {
    /**
     * Styles to be applied to the text component
     */
    style: PropTypes.any,
    /**
     * Address to be rendered and resolved
     */
    address: PropTypes.string,
    /**
     * Type of formatting for the address
     * can be "short" or "full"
     */
    type: PropTypes.string,
  };

  ens = null;
  constructor(props) {
    super(props);
    const { address, type } = props;

    this.state = {
      ensName: null,
      address: formatAddress(address, type),
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.address && prevProps.address !== this.props.address) {
      requestAnimationFrame(() => {
        this.formatAndResolveIfNeeded();
      });
    }
  }

  formatAndResolveIfNeeded() {
    const { address, type } = this.props;
    const formattedAddress = formatAddress(address, type);
    this.setState({ address: formattedAddress, ensName: null });
  }

  render() {
    return (
      <View style={{flexDirection: "row"}}>
        <Text style={this.props.style} numberOfLines={1}>
          {this.state.address}
        </Text>
        <Feather name={"copy"}
          size={14}
          color={colors.primary.default}
           />
      </View>
    );
  }
}

EthereumAddress.defaultProps = {
  style: null,
  type: 'full',
};

export default EthereumAddress;
