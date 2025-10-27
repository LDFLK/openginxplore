import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  allDepartmentData: {},
  departmentHistory: {}  
};

const allDepartmentDataSlice = createSlice({
  name: "allDepartmentData",
  initialState,
  reducers: {
    setAllDepartmentData(state, action) {
      state.allDepartmentData = action.payload;
    },
    setDepartmentHistory(state, action) { 
      state.departmentHistory = action.payload;
    }
  }
});

export const { setAllDepartmentData, setDepartmentHistory } = allDepartmentDataSlice.actions;
export default allDepartmentDataSlice.reducer;
