import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Image, View, Dimensions, DeviceEventEmitter, StyleSheet, ImageBackground, Pressable } from 'react-native';
import PropTypes from 'prop-types';
import { getNodeFinderViewNavbarOptions } from '../../UI/Navbar';
import Device from '../../../util/device';
import { baseStyles } from '../../../styles/common';
import { DrawerContext } from '../../Nav/Main/MainNavigator';
import { useTheme } from '../../../util/theme';
import Text from '../../Base/Text';
import FindLocalDevices from 'react-native-find-local-devices';
import AssetElement from '../../UI/AssetElement';
import TokenImage from '../../UI/TokenImage';
import { ScrollView } from 'react-native-gesture-handler';

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
  } = props;
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
    ipAddress:{
      flex: 1,
      paddingTop: 10,
      fontSize: 18,
      height: 50,
      width: "auto", 
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
      overflow: 'hidden'
    },
  });

  const getStyles = () => {
    const styles = createStyles(useTheme());
    return styles;
  };

  useEffect(
    () => {
      navigation.setOptions(
        getNodeFinderViewNavbarOptions(navigation, route, drawerRef, colors),
      );
    },
    /* eslint-disable-next-line */
    [navigation, route, colors],
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


  const [devices, setDevices] = useState([]);
  
  NewDeviceFoundSubscription = DeviceEventEmitter.addListener(
    NEW_DEVICE_FOUND,
    (device) => {
      if (device.ipAddress && device.port) {
        console.log("NEW DECIVE FOUND: "+device);
        setDevices([...devices, device]);
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
      const lastnumber_arr = String(device.ipAddress).split('.')
      if(lastnumber_arr[lastnumber_arr.length - 1] == "254"){
        NewDeviceFoundSubscription.remove();
        ResultsSubscription.remove();
        CheckDeviceSubscription.remove();
        NoDevicesSubscription.remove();
        NoPortsSubscription.remove();
      }
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

  const nodeSelected = (node) => {
    console.log('selected node') 
  };

  const renderItem = (asset) => {
  
    const styles = getStyles(); 
    return (
      <Pressable key={asset.ipAddress} onPress={nodeSelected} style={styles.assetElement}>
        <View
        testID={'asset'}
        //onLongPress={asset.isETH ? null : this.showRemoveMenu}
        style={{
          flex: 1,
          height: 90,
          flexDirection: 'row',
        }}
        >
        <Image source={require("../../../images/server.png")} style={styles.logo}/>
          <Text
            style={styles.ipAddress}
          >
            {asset.ipAddress}
          </Text>
          <Text style={styles.arrow}>{">"}</Text>
      </View>
      </Pressable>
    );
  };

  return (
    <View style={{flex: 1}}>
      <ImageBackground
          source={require("../../../images/bluedotbackground.png")}
          style={{ flex: 1,
            width: null,
            height: null, 
            paddingTop: 100,
            marginTop: -100
            }}
          >
      <ScrollView>
      {devices.map((item) => renderItem(item))}
      </ScrollView>
      </ImageBackground>
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
