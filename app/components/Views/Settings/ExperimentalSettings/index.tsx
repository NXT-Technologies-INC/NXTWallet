import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, View, ImageBackground } from 'react-native';
import StyledButton from '../../../UI/StyledButton';
import { fontStyles } from '../../../../styles/common';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { strings } from '../../../../../locales/i18n';
import { useTheme } from '../../../../util/theme';

const createStyles = (colors: any) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      padding: 24,
      paddingBottom: 48,
    },
    title: {
      ...(fontStyles.normal as any),
      color: colors.text.default,
      fontSize: 20,
      lineHeight: 20,
      paddingTop: 4,
      marginTop: -4,
    },
    desc: {
      ...(fontStyles.normal as any),
      color: colors.text.alternative,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 12,
    },
    setting: {
      marginVertical: 18,
    },
    clearHistoryConfirm: {
      marginTop: 18,
    },
  });

interface Props {
  /**
	/* navigation object required to push new views
	*/
  navigation: any;
  /**
   * contains params that are passed in from navigation
   */
  route: any;
}

/**
 * Main view for app Experimental Settings
 */
const ExperimentalSettings = ({ navigation, route }: Props) => {
  const isFullScreenModal = route?.params?.isFullScreenModal;
  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(
    () => {
      navigation.setOptions(
        getNavigationOptionsTitle(
          strings('app_settings.experimental_title'),
          navigation,
          isFullScreenModal,
          colors,
        ),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors],
  );

  const goToWalletConnectSessions = useCallback(() => {
    navigation.navigate('WalletConnectSessionsView');
  }, [navigation]);

  return (
    <ImageBackground 
          source={require("../../../../images/BACKGROUND.jpg")}
          style={{ flex: 1,
            width: null,
            height: null,
            paddingBottom: 70,
            paddingTop: 100,
            marginTop: -100
            }}
          >
    <ScrollView style={styles.wrapper}>
      <View style={styles.setting}>
        <View>
          <Text style={styles.title}>
            {strings('experimental_settings.wallet_connect_dapps')}
          </Text>
          <Text style={styles.desc}>
            {strings('experimental_settings.wallet_connect_dapps_desc')}
          </Text>
          <StyledButton
            type="normal"
            onPress={goToWalletConnectSessions}
            containerStyle={styles.clearHistoryConfirm}
          >
            {strings('experimental_settings.wallet_connect_dapps_cta')}
          </StyledButton>
        </View>
      </View>
    </ScrollView>
    </ImageBackground>
  );
};

export default ExperimentalSettings;
