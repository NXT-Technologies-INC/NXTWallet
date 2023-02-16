/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/no-commonjs */
import React from 'react';
import { Animated, Dimensions, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import LottieView from 'lottie-react-native';
import { useTheme, useAssetFromTheme } from '../../../util/theme';

const LOGO_SIZE = 175;
const LOGO_PADDING = 25;

const wordmarkLight = require('../../../animations/wordmark-light.json');
const wordmarkDark = require('../../../animations/wordmark-dark.json');

const createStyles = (colors: any) =>
  StyleSheet.create({
    main: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'black',
      flex: 1
    },
    animation: {
      height: Dimensions.get("window").height,
      width: Dimensions.get("window").width,
      ...StyleSheet.absoluteFillObject,
    },
  });

const MetaMaskAnimation = ({
  opacity,
  animation,
  animationName,
  onAnimationFinish,
}: {
  opacity: number;
  animation: any;
  animationName: any;
  onAnimationFinish: () => void;
}): JSX.Element => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const wordmark = useAssetFromTheme(wordmarkLight, wordmarkDark);

  return (
    <View style={styles.main}>
            <LottieView
              ref={animation}
              style={styles.animation}
              loop={false}
              resizeMode='cover'
              // eslint-disable-next-line
              source={require('../../../animations/test-lottie.json')}
              onAnimationFinish={onAnimationFinish}
            />
    </View>
  );
};

MetaMaskAnimation.propTypes = {
  opacity: PropTypes.object,
  animation: PropTypes.object,
  animationName: PropTypes.object,
  onAnimationFinish: PropTypes.func,
};

export default MetaMaskAnimation;
