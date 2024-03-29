import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, ImageBackground } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getHasOrders } from '../../../reducers/fiatOrders';
import getNavbarOptions from '../../UI/Navbar';
import TransactionsView from '../TransactionsView';
import TabBar from '../../Base/TabBar';
import { strings } from '../../../../locales/i18n';
import FiatOrdersView from '../FiatOrdersView';
import ErrorBoundary from '../ErrorBoundary';
import { DrawerContext } from '../../Nav/Main/MainNavigator';
import { useTheme } from '../../../util/theme';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});

function ActivityView({ hasOrders }) {
  const { drawerRef } = useContext(DrawerContext);
  const { colors } = useTheme();
  const navigation = useNavigation();

  useEffect(
    () => {
      const title =
        hasOrders ?? false ? 'activity_view.title' : 'transactions_view.title';
      navigation.setOptions(getNavbarOptions(title, false, drawerRef, colors));
    },
    /* eslint-disable-next-line */
    [navigation, hasOrders, colors],
  );

  const renderTabBar = () => (hasOrders ? <TabBar /> : <View />);

  return (

    <ImageBackground 
    source={require("../../../images/BACKGROUND.jpg")}
    style={{ flex: 1,
      width: null,
      height: null,
      paddingBottom: 70,
      paddingTop: 100,
      marginTop: -100
      }}
    >
    <ErrorBoundary view="ActivityView">
      <View style={styles.wrapper}>
        <ScrollableTabView
          renderTabBar={renderTabBar}
          locked={!hasOrders}
          page={!hasOrders ? 0 : undefined}
        >
          <TransactionsView tabLabel={strings('transactions_view.title')} />
          {hasOrders && (
            <FiatOrdersView tabLabel={strings('fiat_on_ramp.purchases')} />
          )}
        </ScrollableTabView>
      </View>
    </ErrorBoundary>
    </ImageBackground>
  );
}

ActivityView.defaultProps = {
  hasOrders: false,
};

ActivityView.propTypes = {
  hasOrders: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  hasOrders: getHasOrders(state),
});

export default connect(mapStateToProps)(ActivityView);
