import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    allMinistryData: {},
    selectedMinistry: "",
}

const allMinistryDataSlice = createSlice({
    name: 'allMinistryData',
    initialState,
    reducers: {
        setSelectedMinistry(state, action){
            state.selectedMinistry = action.payload;
        },
        setAllMinistryData(state, action){
            state.allMinistryData = action.payload;
        }
    }
})

export const {setAllMinistryData, setSelectedMinistry} = allMinistryDataSlice.actions;
export default allMinistryDataSlice.reducer;