// store/presidencySlice.js
// Selection state only. President/gazette server data lives in the
// `usePresidents` React Query hook, not here.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedPresident: null,
  selectedDate: null,
};

const presidencySlice = createSlice({
  name: 'presidency',
  initialState,
  reducers: {
    setSelectedPresident(state, action){
      state.selectedPresident = action.payload;
    },
    setSelectedDate(state, action) {
      state.selectedDate = action.payload;
    },
  },
});

export const { setSelectedPresident, setSelectedDate } = presidencySlice.actions;
export default presidencySlice.reducer;
