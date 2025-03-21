import {configureStore} from '@reduxjs/toolkit';
import themeSliceReduce from './slice/themeSlice';

export const store = configureStore({
  reducer: themeSliceReduce,
});
