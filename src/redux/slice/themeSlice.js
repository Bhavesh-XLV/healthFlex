import {createSlice} from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {isDark: false},
  reducers: {
    changeTheme: state => {
      state.isDark = !state.isDark;
    },
  },
});

export const {changeTheme} = themeSlice.actions;
export default themeSlice.reducer;
