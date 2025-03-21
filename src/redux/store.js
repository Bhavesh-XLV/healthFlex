import {combineReducers, configureStore} from '@reduxjs/toolkit';
import themeSliceReduce from './slice/themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer, persistStore} from 'redux-persist';

const rootReducer = combineReducers({
  reducer: themeSliceReduce,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddle => getDefaultMiddle({serializableCheck: false}),
});
export const persiststore = persistStore(store);
