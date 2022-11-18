import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  InteractionManager,
  ImageBackground
} from 'react-native';
import StyledButton from '../../UI/StyledButton';
import { fontStyles, baseStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { getTransparentOnboardingNavbarOptions } from '../../UI/Navbar';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import Device from '../../../util/device';
import { saveOnboardingEvent } from '../../../actions/onboarding';
import { connect } from 'react-redux';
import AnalyticsV2, { ANALYTICS_EVENTS_V2 } from '../../../util/analyticsV2';
import DefaultPreference from 'react-native-default-preference';
import { METRICS_OPT_IN } from '../../../constants/storage';
import { ThemeContext, mockTheme } from '../../../util/theme';
import { relative } from 'path';
import { capitalize } from 'app/util/general';

const IMAGE_3_RATIO = 215 / 315;
const IMAGE_2_RATIO = 222 / 239;
const IMAGE_1_RATIO = 285 / 203;
const DEVICE_WIDTH = Dimensions.get('window').width;

const IMG_PADDING = Device.isIphoneX() ? 100 : Device.isIphone5S() ? 180 : 220;

const createStyles = (colors) =>
  StyleSheet.create({
    scroll: {
      flexGrow: 1,
    },
    wrapper: {
      paddingVertical: 30,
      flex: 1,
    },
    blackcontainer: {
      backgroundColor: "black",
      paddingVertical: 35,
      paddingHorizontal: 25
    },
    btnGetStarted:{
      fontFamily: "Poppins-Bold",
      fontSize: 23,
      textTransform: "capitalize",
      paddingBottom: 0,
      lineHeight: 28,
      height: 25
    },
    nxtwallet: {
      fontSize: 30,
      lineHeight: 28,
      marginBottom: -5,
      color: colors.primary.default,
      justifyContent: 'center',
      textAlign: 'center',
      ...fontStyles.bold,
    },
    title: {
      fontSize: 24,
      marginBottom: 0,
      color: colors.text.default,
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: "Poppins-Bold",
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 19,
      marginTop: 5,
      marginBottom: 25,
      color: 'white',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: "Poppins-SemiBold",
    },
    ctas: {
      paddingHorizontal: 40,
      paddingBottom: Device.isIphoneX() ? 40 : 20,
      flexDirection: 'column',
    },
    ctaWrapper: {
      justifyContent: 'flex-end',
    },
    carouselImage: {
      width: 115,
      height: 115,
      marginTop: 10
    },
    carouselImageWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20
    },
    circle: {
      width: 8,
      height: 8,
      borderRadius: 8 / 2,
      backgroundColor: colors.icon.default,
      opacity: 0.4,
      marginHorizontal: 8,
    },
    solidCircle: {
      opacity: 1,
    },
    progessContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      marginVertical: 36,
    },
    tab: {
      marginHorizontal: 30,
    },
  });

const nxt_black_logo = require('../../../images/nxtblacklogo.png'); // eslint-disable-line

/**
 * View that is displayed to first time (new) users
 */
class OnboardingCarousel extends PureComponent {
  static propTypes = {
    /**
     * The navigator object
     */
    navigation: PropTypes.object,
    /**
     * Save onboarding event to state
     */
    saveOnboardingEvent: PropTypes.func,
  };

  state = {
    currentTab: 1,
  };

  trackEvent = (eventArgs) => {
    InteractionManager.runAfterInteractions(async () => {
      const metricsOptIn = await DefaultPreference.get(METRICS_OPT_IN);
      if (metricsOptIn) {
        AnalyticsV2.trackEvent(eventArgs);
      } else {
        this.props.saveOnboardingEvent(eventArgs);
      }
    });
  };

  onPressGetStarted = () => {
    this.props.navigation.navigate('Onboarding');
    this.trackEvent(ANALYTICS_EVENTS_V2.ONBOARDING_STARTED);
  };

  renderTabBar = () => <View />;

  onChangeTab = (obj) => {
    this.setState({ currentTab: obj.i + 1 });
    this.trackEvent(ANALYTICS_EVENTS_V2.ONBOARDING_WELCOME_SCREEN_ENGAGEMENT, {
      message_title: strings(`onboarding_carousel.title${[obj.i + 1]}`, {
        locale: 'en',
      }),
    });
  };

  updateNavBar = () => {
    const colors = this.context.colors || mockTheme.colors;
    this.props.navigation.setOptions(
      getTransparentOnboardingNavbarOptions(colors),
    );
  };

  componentDidMount = () => {
    this.updateNavBar();
    this.trackEvent(ANALYTICS_EVENTS_V2.ONBOARDING_WELCOME_MESSAGE_VIEWED);
  };

  componentDidUpdate = () => {
    this.updateNavBar();
  };

  render() {
    const { currentTab } = this.state;
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <View style={baseStyles.flexGrow} testID={'onboarding-carousel-screen'}>
        <ImageBackground 
          source={require("../../../images/bluedotbackground.png")}
          style={{ flex: 1,
            width: null,
            height: null,
            }}
          >
            <View style={styles.wrapper}>
                        <View style={styles.carouselImageWrapper}>
                      <Image
                          source={nxt_black_logo}
                          style={[styles.carouselImage]}
                          resizeMethod={'auto'}
                        />
                        </View>
                        <View style={styles.blackcontainer}>
                          
                        <Text
                          style={styles.nxtwallet}
                        >
                          {"NXTWallet"}
                        </Text>
                        <Text
                          style={styles.title}
                          testID={`carousel-screen-three`}
                        >
                          {strings(`onboarding_carousel.title3`)}
                        </Text>
                        <Text style={styles.subtitle}>
                          {strings(`onboarding_carousel.subtitle3`)}
                        </Text>

                        <StyledButton
                          type={'confirm'}
                          style={styles.btnGetStarted}
                          onPress={this.onPressGetStarted}
                          testID={'onboarding-get-started-button'}
                        >
                          {strings('onboarding_carousel.get_started')}
                        </StyledButton>
                      </View>
            </View>
        </ImageBackground>
      </View>
    );
  }
}

OnboardingCarousel.contextType = ThemeContext;

const mapDispatchToProps = (dispatch) => ({
  saveOnboardingEvent: (...eventArgs) =>
    dispatch(saveOnboardingEvent(eventArgs)),
});

export default connect(null, mapDispatchToProps)(OnboardingCarousel);
