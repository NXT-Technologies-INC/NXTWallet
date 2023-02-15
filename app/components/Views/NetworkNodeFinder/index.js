import React, { useContext, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { View, Dimensions, DeviceEventEmitter } from 'react-native';
import PropTypes from 'prop-types';
import {
  createNewTab,
  closeAllTabs,
  closeTab,
  setActiveTab,
  updateTab,
} from '../../../actions/browser';
import Tabs from '../../UI/Tabs';
import { getNodeFinderViewNavbarOptions } from '../../UI/Navbar';
import { captureScreen } from 'react-native-view-shot';
import Logger from '../../../util/Logger';
import Device from '../../../util/device';
import BrowserTab from '../BrowserTab';
import AppConstants from '../../../core/AppConstants';
import { baseStyles } from '../../../styles/common';
import { DrawerContext } from '../../Nav/Main/MainNavigator';
import { useTheme } from '../../../util/theme';
import { Text } from 'react-native-svg';
import FindLocalDevices from 'react-native-find-local-devices';

const margin = 16;
const THUMB_WIDTH = Dimensions.get('window').width / 2 - margin * 2;
const THUMB_HEIGHT = Device.isIos() ? THUMB_WIDTH * 1.81 : THUMB_WIDTH * 1.48;

/**
 * Component that wraps all the browser
 * individual tabs and the tabs view
 */
const NetworkNodeFinder = (props) => {
  const {
    route,
    navigation,
    createNewTab,
    closeAllTabs: triggerCloseAllTabs,
    closeTab: triggerCloseTab,
    setActiveTab,
    updateTab,
    activeTab: activeTabId,
    tabs,
  } = props;
  const { drawerRef } = useContext(DrawerContext);
  const previousTabs = useRef(null);
  const { colors } = useTheme();

  useEffect(
    () => {
      navigation.setOptions(
        getNodeFinderViewNavbarOptions(navigation, route, drawerRef, colors),
      );
    },
    /* eslint-disable-next-line */
    [navigation, route, colors],
  );


  // componentDidMount
  useEffect(
    () => {
      
    },
    /* eslint-disable-next-line */
    [],
  );



  const NEW_DEVICE_FOUND = 'NEW_DEVICE_FOUND';
  const CHECK = 'CHECK';
  const NO_DEVICES = 'NO_DEVICES';
  const NO_PORTS = 'NO_PORTS';
  const RESULTS = 'RESULTS';
  const CONNECTION_ERROR = 'CONNECTION_ERROR';

  var NewDeviceFoundSubscription = null;
  var ResultsSubscription = null;
  var CheckDeviceSubscription = null;
  var NoDevicesSubscription = null;
  var NoPortsSubscription = null;
  var ConnectionErrorSubscription = null;

  NewDeviceFoundSubscription = DeviceEventEmitter.addListener(
    NEW_DEVICE_FOUND,
    (device) => {
      if (device.ipAddress && device.port) {

        console.log("NEW DECIVE FOUND: "+device);
      }
    }
  );

  ResultsSubscription = DeviceEventEmitter.addListener(
    RESULTS,
    (devices) => {
      console.log("Results Subscription: "+devices);
      ResultsSubscription.remove();
    }
  );

  CheckDeviceSubscription = DeviceEventEmitter.addListener(
    CHECK,
    (device) => {
      console.log(device);
    }
  );

  NoDevicesSubscription = DeviceEventEmitter.addListener(
    NO_DEVICES,
    () => {
      console.log(NO_DEVICES);
      NoDevicesSubscription.remove();
    }
  );

  NoPortsSubscription = DeviceEventEmitter.addListener(NO_PORTS, () => {
    console.log(NO_PORTS);
    NoPortsSubscription.remove();
  });

  ConnectionErrorSubscription = DeviceEventEmitter.addListener(
    CONNECTION_ERROR,
    (error) => {
      // Handle error messages for each socket connection
       console.log(error.message);
    }
  );

  FindLocalDevices.getLocalDevices({
    ports: [80],
    timeout: 40
  });



  return (

    

    <View style={baseStyles.flexGrow} testID={'browser-screen'}>
      <Text>{'test'}</Text>
    </View>
  );
};

const mapStateToProps = (state) => ({
  tabs: state.browser.tabs,
  activeTab: state.browser.activeTab,
});

const mapDispatchToProps = (dispatch) => ({
});

NetworkNodeFinder.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(NetworkNodeFinder);
