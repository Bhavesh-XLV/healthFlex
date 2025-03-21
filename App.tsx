import React from 'react';
import MainNavigation from './src/components/MainNavigation';
import {Provider} from 'react-redux';
import {persiststore, store} from './src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';

const App = () => {
  return (
    <PersistGate persistor={persiststore}>
      <Provider store={store}>
        <MainNavigation />
      </Provider>
    </PersistGate>
  );
};

export default App;
