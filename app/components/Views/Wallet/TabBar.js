const React = require('react');
const { ViewPropTypes, TouchableOpacity, InteractionManager } = ReactNative = require('react-native');
const PropTypes = require('prop-types');
const createReactClass = require('create-react-class');
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import { colors } from '../../../styles/common';
import Engine from '../../../core/Engine';
import AnalyticsV2 from '../../../util/analyticsV2';
import { getDecimalChainId } from '../../../util/networks';

const {
  StyleSheet,
  Text,
  View,
  Animated,
} = ReactNative;
const Button = require('./Button');

const TabBar = createReactClass({
  propTypes: {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs: PropTypes.array,
    backgroundColor: PropTypes.string,
    activeTextColor: PropTypes.string,
    inactiveTextColor: PropTypes.string,
    textStyle: Text.propTypes.style,
    tabStyle: ViewPropTypes.style,
    renderTab: PropTypes.func,
    underlineStyle: ViewPropTypes.style,
    navigation: PropTypes.object
  },

  getDefaultProps() {
    return {
      activeTextColor: 'navy',
      inactiveTextColor: 'black',
      backgroundColor: null,
    };
  },

  getInitialState: function() {
    return  { isAddTokenEnabled: false };
  },

  renderTabOption(name, page) {
  },

  renderTab(name, page, isTabActive, onPressHandler) {
    const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return <Button
      style={{flex: 1, }}
      key={name}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits='button'
      onPress={() => onPressHandler(page)}
    >
      <View style={[styles.tab, this.props.tabStyle, ]}>
        <Text style={[{color: textColor, fontWeight, }, textStyle, ]}>
          {name}
        </Text>
      </View>
    </Button>;
  },


  addToken () {
    const { navigation } = this.props;
    const { NetworkController } = Engine.context;
    this.state = { isAddTokenEnabled: false };
    navigation.push('AddAsset', { assetType: 'token' });
    InteractionManager.runAfterInteractions(() => {
      AnalyticsV2.trackEvent(
        AnalyticsV2.ANALYTICS_EVENTS.TOKEN_IMPORT_CLICKED,
        {
          source: 'manual',
          chain_id: getDecimalChainId(
            NetworkController?.state?.provider?.chainId,
          ),
        },
      );
      this.state = { isAddTokenEnabled: true };
    });
  },

  render() {
    const containerWidth = this.props.containerWidth*.26;
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };

    const translateX = this.props.scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0,  containerWidth / numberOfTabs],
    });

    

    return (
        <View style={styles.container}>
            <View style={{flex:.8}}>
                <View style={[styles.tabs, {backgroundColor: this.props.backgroundColor, }, this.props.style, ]}>
                    {this.props.tabs.map((name, page) => {
                    const isTabActive = this.props.activeTab === page;
                    const renderTab = this.props.renderTab || this.renderTab;
                    return renderTab(name, page, isTabActive, this.props.goToPage);
                    })}
                    <Animated.View
                    style={[
                        tabUnderlineStyle,
                        {
                        transform: [
                            { translateX },
                        ]
                        },
                        this.props.underlineStyle,
                    ]}
                    />
                </View>
            </View>
            <View style={{flex:2, alignItems: "flex-end", bottom: 1}}>
                <View style={{flexDirection: "row"}}>
                    <TouchableOpacity onPress={onFilterPress} style={{flexDirection:"row"}}>
                        <MaterialCommunityIcon
                        name={"filter-variant"}
                        size={24}
                        style={{color: "white"}}
                        />
                        <Text style={{marginLeft: 5, color: colors.primary.default}}>filter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.add}
                      onPress={this.addToken}
                      disabled={this.state.isAddTokenEnabled}
                      testID={'add-token-button'}
                    >
                      <Octicons
                      name={"plus"}
                      color={"white"}
                      size={21}
                    />
                    </TouchableOpacity>
                </View>
            </View>
      </View>
    );
  },
});

function onFilterPress() {
    
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  tabs: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
  container:{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginHorizontal: "3%",
    marginBottom: "5%",
  },
  add: {
    marginLeft: "5%"
  }
});

module.exports = TabBar;
