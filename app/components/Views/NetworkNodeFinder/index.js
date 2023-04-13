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
} from 'react-native';
import PropTypes from 'prop-types';
import { getNodeFinderViewNavbarOptions } from '../../UI/Navbar';
import Device from '../../../util/device';
import { DrawerContext } from '../../Nav/Main/MainNavigator';
import { useTheme } from '../../../util/theme';
import Text from '../../Base/Text';
import { ScrollView } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';

import { NetworkInfo } from 'react-native-network-info';
import Routes from '../../../constants/navigation/Routes';
import { wrap } from '@sentry/browser';
var net = require('react-native-tcp');

const margin = 16;
const THUMB_WIDTH = Dimensions.get('window').width / 2 - margin * 2;
const THUMB_HEIGHT = Device.isIos() ? THUMB_WIDTH * 1.81 : THUMB_WIDTH * 1.48;

/**
 * Component that wraps all the browser
 * individual tabs and the tabs view
 */
const NetworkNodeFinder = (props) => {
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
      connected: {
        flex: 1,
        paddingTop: 2,
        fontSize: 14,
        height: 50,
        width: 'auto',
        flexBasis: 300,
        color: 'lime',
      },
    });

  const getStyles = () => {
    const styles = createStyles(useTheme());
    return styles;
  };

  const isFocused = useIsFocused();

  useEffect(
    () => {
      navigation.setOptions(
        getNodeFinderViewNavbarOptions(navigation, route, drawerRef, colors),
      );

      if (isFocused) {
        setDevices([]);
        runned2 = false;
        setRandom(Math.random);
        init_data();
      }
    },
    /* eslint-disable-next-line */
    [navigation, route, colors, isFocused],
  );

  const [devices, setDevices] = useState([]);

  const [randomNum, setRandom] = useState(0);

  // Function to scan hosts
  var scanHost = function (hostIP, hostPort) {
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
        console.log("try to connect");
        fetch('http://' + hostIP + '/node_info', {
          method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        }})
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
              responseJson.result &&
              responseJson.result.node_name
            ) {
              console.log(responseJson);
              arr_devices.push({
                node_name: responseJson.result.node_name,
                owner: responseJson.result.owner,
                version: responseJson.result.version,
                ipAddress: hostIP,
                port: hostPort,
              });
              setDevices((devices) => {
                return arr_devices;
              });
              setRandom(Math.random);
              console.log(arr_devices);
            }
          })
          .catch((error) => {
            console.error(error);
          });

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

  //let hola = [{"ipAddress": "192.168.1.88", "port": 80},{"ipAddress": "192.168.1.89", "port": 80}]

  // Get Local IP

  const arr_devices = [];

  let runned2 = false;

  function init_data(){
    console.log('init_data')
    NetworkInfo.getIPV4Address().then((ipAddress) => {
      console.log('network info')
      if (!runned2) {
        console.log('runned')
        let ip_arr = ipAddress.split('.');
        let ip = ip_arr[0]+'.'+ip_arr[1]+'.'+ip_arr[2]+'.'
        console.log(ip)
        for (let i = 0; i <= 255; i++) {
          console.log(ip+i)
          scanHost(ip+ i, 80)
            .then((response) => {
              console.log(response);
            })
            .catch((err) => {
              //console.error(err);
              return err;
            });
        }
      }
      runned2 = true;
    });
  }


  const nodeSelected = (node) => {
    console.log('selected node');
    navigation.navigate(Routes.NETWORKNODEVIEW_TAB_HOME, { node });
  };

  const renderConnected = (owner) => {
    const styles = getStyles();
    if (props.selectedAddress == owner) {
      return (
        <View
          testID={'asset'}
          //onLongPress={asset.isETH ? null : this.showRemoveMenu}
          style={{
            flex: 1,
            height: 90,
            flexDirection: 'row',
          }}
        >
          <Image style={styles.logo} />
          <Text style={styles.connected}>Connected</Text>
          <Text style={styles.arrow}></Text>
        </View>
      );
    }
    return null;
  };

  const renderItem = (asset) => {
    const styles = getStyles();
    return (
      <Pressable
        key={asset.ipAddress}
        onPress={() => nodeSelected(asset)}
        style={styles.assetElement}
      >
        <View
          testID={'asset'}
          //onLongPress={asset.isETH ? null : this.showRemoveMenu}
          style={{
            flex: 1,
            height: 90,
            flexDirection: 'row',
          }}
        >
          <Image
            source={require('../../../images/server.png')}
            style={styles.logo}
          />
          <Text style={styles.ipAddress}>{asset.node_name}</Text>
          <Text style={styles.arrow}>{'>'}</Text>
        </View>
        {renderConnected(asset.owner)}
      </Pressable>
    );
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
        <ScrollView>{devices.map((item) => renderItem(item))}</ScrollView>
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
