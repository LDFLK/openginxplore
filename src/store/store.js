import { configureStore } from '@reduxjs/toolkit';
import presidencyReducer from './presidencySlice';
import gazetteDataReducer from './gazetteDate';
import allDepartmentDataReducer from './allDepartmentData';

const store = configureStore({
  reducer: {
    presidency: presidencyReducer,
    gazettes: gazetteDataReducer,
    allDepartmentData: allDepartmentDataReducer,
  },
});

export default store;
