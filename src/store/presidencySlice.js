// store/presidencySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  presidentDict: {},
  presidentRelationDict: {},
  selectedPresident: null,
  selectedDate: null,
  initialized: false,
};

const presidencySlice = createSlice({
  name: 'presidency',
  initialState,
  reducers: {
    setPresidentDict(state, action){
      state.presidentDict = action.payload;
    },
    setPresidentRelationDict(state, action){
      state.presidentRelationDict = action.payload;
    },
    setSelectedPresident(state, action){
      state.selectedPresident = action.payload;
    },
    setSelectedDate(state, action) {
      state.selectedDate = action.payload;
    },
    initializeSelection(state) {
      if (!state.initialized && state.presidentDict.length > 0) {
        state.initialized = true;
      }
    },
  },
});

export const { setPresidentDict, setPresidentRelationDict, setSelectedPresident, setSelectedDate, initializeSelection } = presidencySlice.actions;
export default presidencySlice.reducer;
