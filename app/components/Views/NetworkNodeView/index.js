import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import {
  Image,
  View,
  Dimensions,
  DeviceEventEmitter,
  StyleSheet,
  ImageBackground,
  Pressable,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import { getNodeFinderViewNavbarOptions } from '../../UI/Navbar';
import Device from '../../../util/device';
import { DrawerContext } from '../../Nav/Main/MainNavigator';
import { useTheme } from '../../../util/theme';
import Text from '../../Base/Text';
import StyledButton from '../../UI/StyledButton';
import { ScrollView } from 'react-native-gesture-handler';

import { NetworkInfo } from 'react-native-network-info';
var net = require('react-native-tcp');

const margin = 16;
const THUMB_WIDTH = Dimensions.get('window').width / 2 - margin * 2;
const THUMB_HEIGHT = Device.isIos() ? THUMB_WIDTH * 1.81 : THUMB_WIDTH * 1.48;

/**
 * Component that wraps all the browser
 * individual tabs and the tabs view
 */
const NetworkNodeView = (props) => {
  const { route, navigation } = props;
  const { drawerRef } = useContext(DrawerContext);
  const { colors } = useTheme();

  const createStyles = (colors) =>
    StyleSheet.create({
      logo: {
        flex: 1,
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 20,
        flexBasis: 50,
      },
      ipAddress: {
        flex: 1,
        paddingTop: 10,
        fontSize: 18,
        height: 50,
        width: 'auto',
        flexBasis: 300,
      },
      arrow: {
        flex: 1,
        fontSize: 26,
        right: 30,
        top: 3,
        height: 50,
        width: 30,
        flexBasis: 30,
      },
      assetElement: {
        borderBottomWidth: 1,
        borderColor: '#333',
        flex: 1,
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        height: 90,
        maxHeight: 70,
        minHeight: 70,
        backgroundColor: 'black',
        overflow: 'hidden',
      },
      rightButton: {
        marginLeft: 3,
      },
      buttonText: {
        paddingTop: 3,
        paddingBottom: 3,
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontFamily: 'Poppins-Regular',
      },
      buttonTextBlack: {
        paddingTop: 3,
        paddingBottom: 3,
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontFamily: 'Poppins-Regular',
      },
      buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      button: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        borderWidth: 1.5,
        paddingHorizontal: 8,
        paddingVertical: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
      label: {
        textAlign: 'center',
        fontSize: 16,
      },
      status: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 16,
      },
      statusConnected: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 16,
        color: 'lime'
      },
    });

  useEffect(
    () => {
      navigation.setOptions(
        getNodeFinderViewNavbarOptions(navigation, route, drawerRef, colors),
      );
    },
    /* eslint-disable-next-line */
    [navigation, route, colors],
  );

  const notifyMessage = (msg) => {
    Alert.alert('NXTWallet', msg, [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }

  const link = () => {
    console.log('link_node');
    fetch('http://' + node.ipAddress + '/link_to_wallet/' + props.selectedAddress)
      .then((response) => response.text())
      .then((text) => {
        //console.log(response);
        try {
          return JSON.parse(text);
        } catch (e) {
          console.log(e);
          return {};
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        if (
          typeof responseJson !== 'undefined' &&
          responseJson.status &&
          responseJson.status.statusCode
        ) {
          if(responseJson.status.statusCode == 200){
            notifyMessage(responseJson.status.message);
            navigation.goBack()
          }else{
            notifyMessage(responseJson.status.message);
          }
          console.log(responseJson);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };


  const unlink = () => {
    console.log('unlink node');
    fetch('http://' + node.ipAddress + '/unlink_to_wallet/' + props.selectedAddress)
      .then((response) => response.text())
      .then((text) => {
        //console.log(response);
        try {
          return JSON.parse(text);
        } catch (e) {
          console.log(e);
          return {};
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        if (
          typeof responseJson !== 'undefined' &&
          responseJson.status &&
          responseJson.status.statusCode
        ) {
          if(responseJson.status.statusCode == 200){
            notifyMessage(responseJson.status.message);
            navigation.goBack()
          }else{
            notifyMessage(responseJson.status.message);
          }
          console.log(responseJson);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const test = () => {
    console.log('unlink node');
    fetch('http://' + node.ipAddress + '/node_info/')
      .then((response) => response.text())
      .then((text) => {
        //console.log(response);
        try {
          return JSON.parse(text);
        } catch (e) {
          console.log(e);
          return {};
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        if (
          typeof responseJson !== 'undefined' &&
          responseJson.status &&
          responseJson.status.statusCode
        ) {
          if(responseJson.status.statusCode == 200){
            //
            notifyMessage("test");
            navigation.goBack()
          }
          console.log(responseJson);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  console.log(props.selectedAddress);

  const node = route.params.node;
  const styles = createStyles(useTheme());

  const renderConnected = (owner) => {

    if (owner == '')
      return (
        <View>
          <Text style={styles.status}>You can Link this node to your address</Text>
          <StyledButton
            type="blue"
            onPress={link}
            containerStyle={[styles.button, styles.rightButton]}
            testID={'drawer-receive-button'}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTextBlack}>{'Link Node'}</Text>
            </View>
          </StyledButton>
        </View>
      );

    if (props.selectedAddress == owner)
      return (
        <View>
          <Text style={styles.statusConnected}>Connected</Text>
          <StyledButton
            type="warning"
            onPress={unlink}
            containerStyle={[styles.button, styles.rightButton]}
            testID={'drawer-receive-button'}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>{'UNLink Node'}</Text>
            </View>
          </StyledButton>
        </View>
      );
    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../images/bluedotbackground.png')}
        style={{
          flex: 1,
          width: null,
          height: null,
          paddingTop: 100,
          marginTop: -100,
        }}
      >
        <View style={{ padding: 18 }}>
          <Text style={styles.label}>{node.node_name}</Text>
          <Text style={styles.label}>Version: {node.version}</Text>
          <Text style={styles.label}>{node.ipAddress}</Text>
          {renderConnected(node.owner)}
        </View>
      </ImageBackground>
    </View>
  );
};

const mapStateToProps = ({
  engine: {
    backgroundState: {
      PreferencesController,
      AccountTrackerController,
      CurrencyRateController,
    },
  },
}) => {
  const { selectedAddress } = PreferencesController;
  const { accounts } = AccountTrackerController;

  return { selectedAddress };
};

const mapDispatchToProps = (dispatch) => ({});

NetworkNodeView.propTypes = {
  /**
   * react-navigation object used to switch between screens
   */
  navigation: PropTypes.object,
  /**
   * Function to create a new tab
   */
  createNewTab: PropTypes.func,
  /**
   * Function to close all the existing tabs
   */
  closeAllTabs: PropTypes.func,
  /**
   * Function to close a specific tab
   */
  closeTab: PropTypes.func,
  /**
   * Function to set the active tab
   */
  setActiveTab: PropTypes.func,
  /**
   * Function to set the update the url of a tab
   */
  updateTab: PropTypes.func,
  /**
   * Array of tabs
   */
  tabs: PropTypes.array,
  /**
   * ID of the active tab
   */
  activeTab: PropTypes.number,
  /**
   * Object that represents the current route info like params passed to it
   */
  route: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(NetworkNodeView);
