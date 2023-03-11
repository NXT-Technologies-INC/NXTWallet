import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  InteractionManager,
  ImageBackground,
} from 'react-native';
import { swapsUtils } from '@metamask/swaps-controller';
import { connect } from 'react-redux';
import Engine from '../../../core/Engine';
import Analytics from '../../../core/Analytics/Analytics';
import AnalyticsV2 from '../../../util/analyticsV2';
import AppConstants from '../../../core/AppConstants';
import { strings } from '../../../../locales/i18n';

import { swapsLivenessSelector } from '../../../reducers/swaps';
import { showAlert } from '../../../actions/alert';
import { protectWalletModalVisible } from '../../../actions/user';
import {
  toggleAccountsModal,
  toggleReceiveModal,
} from '../../../actions/modals';
import { newAssetTransaction } from '../../../actions/transaction';

import Device from '../../../util/device';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { renderFiat } from '../../../util/number';
import { isQRHardwareAccount, renderAccountName } from '../../../util/address';
import { getEther } from '../../../util/transactions';
import {
  doENSReverseLookup,
  isDefaultAccountName,
} from '../../../util/ENSUtils';
import { isSwapsAllowed } from '../Swaps/utils';

import Identicon from '../Identicon';
import AssetActionButton from '../AssetActionButton';
import EthereumAddress from '../EthereumAddress';
import { fontStyles, baseStyles } from '../../../styles/common';
import { allowedToBuy } from '../FiatOrders';
import AssetSwapButton from '../Swaps/components/AssetSwapButton';
import ClipboardManager from '../../../core/ClipboardManager';
import { ThemeContext, mockTheme } from '../../../util/theme';
import Routes from '../../../constants/navigation/Routes';
import { getCrypto } from '@walletconnect/utils';
import NetworkMainAssetLogo from '../NetworkMainAssetLogo';
import {
  hasBlockExplorer,
  findBlockExplorerForRpc,
  getBlockExplorerName,
} from '../../../util/networks';

import { NetworkInfo } from 'react-native-network-info';
var net = require('react-native-tcp');

const createStyles = (colors) =>
  StyleSheet.create({
    scrollView: {},
    wrapper: {
      paddingTop: 20,
      paddingBottom: 0,
      alignItems: 'center',
    },
    info: {
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      width: '60%',
      backgroundColor: 'black',
    },
    accountRounded: {
      alignItems: 'center',
      borderRadius: 25,
      paddingTop: '5%',
      marginBottom: '5%',
      width: '100%',
    },
    data: {
      textAlign: 'center',
      paddingTop: 7,
      marginTop: 8,
      marginBottom: 5,
      backgroundColor: 'black',
    },
    label: {
      fontSize: 24,
      textAlign: 'center',
      ...fontStyles.normal,
      color: colors.text.default,
      fontFamily: 'Poppins-Bold',
      backgroundColor: 'black',
      lineHeight: 26,
    },
    labelInput: {
      backgroundColor: 'black',
      marginBottom: Device.isAndroid() ? -10 : 0,
    },
    labelWrapper: {
      backgroundColor: 'black',
      flexDirection: 'row',
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
      padding: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: colors.text.default,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'black',
    },
    tagText: {
      fontSize: 12,
      ...fontStyles.bold,
      minWidth: 32,
      textAlign: 'center',
      color: colors.text.default,
      backgroundColor: 'black',
    },
    addressWrapper: {
      backgroundColor: '#505050',
      borderWidth: 1.5,
      borderRadius: 10,
      marginTop: 15,
      marginBottom: 20,
      paddingVertical: 3,
      paddingHorizontal: 15,
      width: 200,
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    address: {
      fontSize: 10,
      color: '#FFFFFF',
      ...fontStyles.thin,
      letterSpacing: 2,
      marginRight: 10,
    },
    amountETH: {
      fontSize: 24,
      color: 'white',
      ...fontStyles.normal,
      fontFamily: 'Poppins-Bold',
      backgroundColor: 'black',
    },
    symbolETH: {
      fontSize: 24,
      color: 'white',
      ...fontStyles.bold,
      fontFamily: 'Poppins-Bold',
    },
    amountFiat: {
      fontSize: 14,
      color: 'white',
      ...fontStyles.normal,
      flexDirection: 'row',
      textAlign: 'center',
      fontFamily: 'Poppins-Bold',
      backgroundColor: 'black',
    },
    identiconBorder: {
      borderRadius: 80,
      borderWidth: 2,
      padding: 2,
      borderColor: colors.primary.default,
    },
    onboardingWizardLabel: {
      borderWidth: 2,
      borderRadius: 4,
      paddingVertical: Device.isIos() ? 2 : -4,
      paddingHorizontal: Device.isIos() ? 5 : 5,
      top: Device.isIos() ? 0 : -2,
    },
    actionsContainer: {
      paddingTop: 30,
      flex: 1,
      justifyContent: 'space-evenly',
      alignItems: 'flex-start',
      flexDirection: 'row',
      width: '100%',
      backgroundColor: 'black',
      paddingBottom: 30,
    },
    actions: {
      justifyContent: 'space-evenly',
      alignItems: 'flex-start',
      flexDirection: 'row',
      width: 250,
      backgroundColor: 'black',
    },
    ethLogo: {
      marginTop: -15,
      width: 85,
      height: 85,
      borderRadius: 25,
      overflow: 'hidden',
      flex: 1,
      alignContent: 'flex-end',
    },
  });

/**
 * View that's part of the <Wallet /> component
 * which shows information about the selected account
 */
class AccountOverview extends PureComponent {
  static propTypes = {
    /**
     * String that represents the selected address
     */
    selectedAddress: PropTypes.string,
    /**
    /* Identities object required to get account name
    */
    identities: PropTypes.object,
    /**
     * Object that represents the selected account
     */
    account: PropTypes.object,
    /**
    /* Selected currency
    */
    currentCurrency: PropTypes.string,
    /**
    /* Triggers global alert
    */
    showAlert: PropTypes.func,
    /**
     * Action that toggles the accounts modal
     */
    toggleAccountsModal: PropTypes.func,
    /**
     * whether component is being rendered from onboarding wizard
     */
    onboardingWizard: PropTypes.bool,
    /**
     * Used to get child ref
     */
    onRef: PropTypes.func,
    /**
     * Prompts protect wallet modal
     */
    protectWalletModalVisible: PropTypes.func,
    /**
     * Start transaction with asset
     */
    newAssetTransaction: PropTypes.func,
    /**
    /* navigation object required to access the props
    /* passed by the parent component
    */
    navigation: PropTypes.object,
    /**
     * Action that toggles the receive modal
     */
    toggleReceiveModal: PropTypes.func,
    /**
     * Chain id
     */
    chainId: PropTypes.string,
    /**
     * Wether Swaps feature is live or not
     */
    swapsIsLive: PropTypes.bool,
    /**
     * ID of the current network
     */
    network: PropTypes.string,
    /**
     * Current provider ticker
     */
    ticker: PropTypes.string,
    ethAsset: PropTypes.array,
  };

  state = {
    accountLabelEditable: false,
    accountLabel: '',
    originalAccountLabel: '',
    ens: undefined,
  };

  editableLabelRef = React.createRef();
  scrollViewContainer = React.createRef();
  mainView = React.createRef();

  animatingAccountsModal = false;

  toggleAccountsModal = () => {
    const { onboardingWizard } = this.props;
    if (!onboardingWizard && !this.animatingAccountsModal) {
      this.animatingAccountsModal = true;
      this.props.toggleAccountsModal();
      setTimeout(() => {
        this.animatingAccountsModal = false;
      }, 500);
    }
  };

  isAccountLabelDefined = (accountLabel) =>
    !!accountLabel && !!accountLabel.trim().length;

  input = React.createRef();

  componentDidMount = () => {
    const { identities, selectedAddress, onRef } = this.props;
    const accountLabel = renderAccountName(selectedAddress, identities);
    this.setState({ accountLabel });
    onRef && onRef(this);
    InteractionManager.runAfterInteractions(() => {
      this.doENSLookup();
    });

    const { PreferencesController } = Engine.context;
    if (!this.isAccountLabelDefined(accountLabel)) {
      PreferencesController.setAccountLabel(selectedAddress, 'Account');
    }
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.account.address !== this.props.account.address ||
      prevProps.network !== this.props.network
    ) {
      requestAnimationFrame(() => {
        this.doENSLookup();
      });
    }
  }

  setAccountLabel = () => {
    const { PreferencesController } = Engine.context;
    const { selectedAddress } = this.props;
    const { accountLabel } = this.state;

    const lastAccountLabel =
      PreferencesController.state.identities[selectedAddress].name;

    PreferencesController.setAccountLabel(
      selectedAddress,
      this.isAccountLabelDefined(accountLabel)
        ? accountLabel
        : lastAccountLabel,
    );
    this.setState({ accountLabelEditable: false });
  };

  onAccountLabelChange = (accountLabel) => {
    this.setState({ accountLabel });
  };

  setAccountLabelEditable = () => {
    const { identities, selectedAddress } = this.props;
    const accountLabel = renderAccountName(selectedAddress, identities);
    this.setState({ accountLabelEditable: true, accountLabel });
    setTimeout(() => {
      this.input && this.input.current && this.input.current.focus();
    }, 100);
  };

  cancelAccountLabelEdition = () => {
    const { identities, selectedAddress } = this.props;
    const accountLabel = renderAccountName(selectedAddress, identities);
    this.setState({ accountLabelEditable: false, accountLabel });
  };

  copyAccountToClipboard = async () => {
    const { selectedAddress } = this.props;
    await ClipboardManager.setString(selectedAddress);
    this.props.showAlert({
      isVisible: true,
      autodismiss: 1500,
      content: 'clipboard-alert',
      data: { msg: strings('account_details.account_copied_to_clipboard') },
    });
    setTimeout(() => this.props.protectWalletModalVisible(), 2000);
    InteractionManager.runAfterInteractions(() => {
      Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_COPIED_ADDRESS);
    });
  };

  onReceive = () => this.props.toggleReceiveModal();

  onSend = () => {
    //const { newAssetTransaction, navigation, ticker } = this.props;
    //newAssetTransaction(getEther(ticker));
    //navigation.navigate('SendFlowView');

    this.props.navigation.navigate(Routes.BROWSER_TAB_HOME);
  };

  onSymbol = () => {
    if (this.props.ethAsset[0].symbol == 'NXT') {
      this.goToBrowserUrl('https://nxtscan.com', 'NXTScan');
    }
    if (this.props.ethAsset[0].symbol == 'ETH') {
      this.goToBrowserUrl('https://etherscan.io', 'EtherScan');
    }
    if (this.props.ethAsset[0].symbol == 'BNB') {
      this.goToBrowserUrl('https://bscscan.com', 'BNBScan');
    }
  };

  goToBrowserUrl(url, title) {
    this.props.navigation.navigate('Webview', {
      screen: 'SimpleWebview',
      params: {
        url,
        title,
      },
    });
  }

  onBuy = () => {
    this.props.navigation.navigate(Routes.FIAT_ON_RAMP_AGGREGATOR.ID);
    InteractionManager.runAfterInteractions(() => {
      Analytics.trackEventWithParameters(
        AnalyticsV2.ANALYTICS_EVENTS.BUY_BUTTON_CLICKED,
        {
          text: 'Buy',
          location: 'Wallet',
          chain_id_destination: this.props.chainId,
        },
      );
    });
  };

  goToSwaps = () =>
    this.props.navigation.navigate('Swaps', {
      screen: 'SwapsAmountView',
      params: {
        sourceToken: swapsUtils.NATIVE_SWAPS_TOKEN_ADDRESS,
      },
    });

  doENSLookup = async () => {
    const { network, account } = this.props;
    try {
      const ens = await doENSReverseLookup(account.address, network);
      this.setState({ ens });
      // eslint-disable-next-line no-empty
    } catch {}
  };

  // Function to scan hosts
  scanHost = function (hostIP, hostPort) {
    return new Promise(function (resolve, reject) {
      var client = net.connect(
        {
          host: hostIP,
          port: hostPort,
        },
        function () {
          //'connect' listener
          console.log('Connected');
        },
      );

      client.setTimeout(2000, function () {
        // called after timeout -> same as socket.on('timeout')
        // it just tells that soket timed out => its ur job to end or destroy the socket.
        // socket.end() vs socket.destroy() => end allows us to send final data and allows some i/o activity to finish before destroying the socket
        // whereas destroy kills the socket immediately irrespective of whether any i/o operation is goin on or not...force destry takes place
        //console.log('Socket timed out');
      });
      client.on('connect', function () {
        resolve({
          ipAddress: hostIP,
          port: hostPort,
        });
      });
      client.on('timeout', function () {
        //console.log('Socket timed out !');
        //client.end('Timed out!');
        // can call socket.destroy() here too.
      });
      client.on('end', function (data) {
        //console.log('Socket ended from other end!');
        //console.log('End data : ' + data);
      });
      client.on('close', function (error) {
        var bread = client.bytesRead;
        var bwrite = client.bytesWritten;
        //console.log('Bytes read : ' + bread);
        //console.log('Bytes written : ' + bwrite);
        //console.log('Socket closed!');
        if (error) {
          //console.log('Socket was closed as a result of transmission error');
        }
      });
      client.on('error', function (err) {
        //console.log('******* ERROR : ' + JSON.stringify(err));
        client.destroy();
      });
      setTimeout(function () {
        var isdestroyed = client.destroyed;
        //console.log('Socket destroyed:' + isdestroyed);
        client.destroy();
      }, 5000);
    });
  };

  runned = false;

  init_data = function () {
    console.log('init_data');
    NetworkInfo.getIPAddress().then((ipAddress) => {
      console.log('network info');
      if (!this.runned) {
        let ip_arr = ipAddress.split('.');
        let ip = ipAddress.replace(ip_arr[ip_arr.length - 1], '');

        this.scanHost(ip + 1, 80)
          .then((response) => {
            console.log(response);
          })
          .catch((err) => {
            //console.error(err);
            return err;
          });
        this.runned = true;
      }
    });
  };

  render() {
    const {
      account: { address, name },
      currentCurrency,
      onboardingWizard,
      chainId,
      swapsIsLive,
    } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    const themeAppearance = this.context.themeAppearance || 'light';
    const styles = createStyles(colors);

    const fiatBalance = `${renderFiat(
      Engine.getTotalFiatAccountBalance(),
      currentCurrency,
    )}`;

    this.init_data();

    if (!address) return null;
    const { accountLabelEditable, accountLabel, ens } = this.state;

    const isQRHardwareWalletAccount = isQRHardwareAccount(address);

    return (
      <View
        style={baseStyles.flexGrow}
        ref={this.scrollViewContainer}
        collapsable={false}
      >
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps={'never'}
          style={styles.scrollView}
          contentContainerStyle={styles.wrapper}
          testID={'account-overview'}
        >
          <View style={{ flex: 3, alignContent: 'flex-start', marginTop: 15 }}>
            <NetworkMainAssetLogo
              big
              style={styles.ethLogo}
              testID={'eth-logo'}
            />
          </View>
          <View style={styles.info} ref={this.mainView}>
            {/*
            <TouchableOpacity
              style={styles.identiconBorder}
              disabled={onboardingWizard}
              onPress={this.toggleAccountsModal}
              testID={'wallet-account-identicon'}
            >
              <Identicon
                address={address}
                diameter={38}
                noFadeIn={onboardingWizard}
              />
            </TouchableOpacity>
            */}
            {/*          */}

            <View
              ref={this.editableLabelRef}
              style={styles.data}
              collapsable={false}
            >
              {accountLabelEditable ? (
                <TextInput
                  style={[
                    styles.label,
                    styles.labelInput,
                    styles.onboardingWizardLabel,
                    onboardingWizard
                      ? { borderColor: colors.primary.default }
                      : { borderColor: colors.background.default },
                  ]}
                  editable={accountLabelEditable}
                  onChangeText={this.onAccountLabelChange}
                  onSubmitEditing={this.setAccountLabel}
                  onBlur={this.setAccountLabel}
                  testID={'account-label-text-input'}
                  value={accountLabel}
                  selectTextOnFocus
                  ref={this.input}
                  returnKeyType={'done'}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  numberOfLines={1}
                  placeholderTextColor={colors.text.muted}
                  keyboardAppearance={themeAppearance}
                />
              ) : (
                <View style={styles.labelWrapper}>
                  <TouchableOpacity onLongPress={this.setAccountLabelEditable}>
                    <Text
                      style={[
                        styles.label,
                        styles.onboardingWizardLabel,
                        {
                          borderColor: onboardingWizard ? 'black' : 'black',
                        },
                      ]}
                      numberOfLines={1}
                      testID={'edit-account-label'}
                    >
                      {isDefaultAccountName(name) && ens ? ens : name}
                    </Text>
                  </TouchableOpacity>
                  {isQRHardwareWalletAccount && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {strings('transaction.hardware')}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View
              style={{ flex: 3, alignContent: 'flex-start', marginTop: -5 }}
            >
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.amountETH}>
                  {this.props.ethAsset[0].balance}
                </Text>
                <Text style={styles.symbolETH}>
                  {' '}
                  {this.props.ethAsset[0].symbol}
                </Text>
              </View>
              <Text style={styles.amountFiat}>{'≈' + fiatBalance}</Text>
            </View>

            <TouchableOpacity
              style={styles.addressWrapper}
              onPress={this.copyAccountToClipboard}
            >
              <EthereumAddress
                address={address}
                style={styles.address}
                type={'short'}
              />
            </TouchableOpacity>
            {/*          */}
          </View>
          <View style={styles.actionsContainer}>
            <View style={styles.actions}>
              {/*
              {
                <AssetActionButton
                  icon="stake"
                  onPress={this.onBuy}
                  label="STAKE"
                />
              }
              <AssetActionButton
                icon="receive"
                onPress={this.onReceive}
                label={strings('asset_overview.receive_button')}
              />
              */}

              <AssetActionButton
                testID={'token-send-button'}
                icon="send"
                onPress={this.onSend}
                label="BROWSER"
              />
              {/* 
              {AppConstants.SWAPS.ACTIVE && (
                <AssetSwapButton
                  isFeatureLive={swapsIsLive}
                  isNetworkAllowed={isSwapsAllowed(chainId)}
                  onPress={this.goToSwaps}
                  isAssetAllowed
                />
              )}
              */}
              <AssetActionButton
                testID={'token-send-button'}
                icon="swap"
                onPress={this.onSymbol}
                label={this.props.ethAsset[0].symbol}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedAddress:
    state.engine.backgroundState.PreferencesController.selectedAddress,
  identities: state.engine.backgroundState.PreferencesController.identities,
  currentCurrency:
    state.engine.backgroundState.CurrencyRateController.currentCurrency,
  chainId: state.engine.backgroundState.NetworkController.provider.chainId,
  ticker: state.engine.backgroundState.NetworkController.provider.ticker,
  network: state.engine.backgroundState.NetworkController.network,
  swapsIsLive: swapsLivenessSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  showAlert: (config) => dispatch(showAlert(config)),
  toggleAccountsModal: () => dispatch(toggleAccountsModal()),
  protectWalletModalVisible: () => dispatch(protectWalletModalVisible()),
  newAssetTransaction: (selectedAsset) =>
    dispatch(newAssetTransaction(selectedAsset)),
  toggleReceiveModal: (asset) => dispatch(toggleReceiveModal(asset)),
});

AccountOverview.contextType = ThemeContext;

export default connect(mapStateToProps, mapDispatchToProps)(AccountOverview);
