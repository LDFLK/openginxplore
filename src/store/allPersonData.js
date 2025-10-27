import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    allPerson: {}
}

const allPersonSlice = createSlice({
    name: 'allPerson',
    initialState,
    reducers: {
        setAllPerson(state, action){
            state.allPerson = action.payload;
        }
    }
})

export const {setAllPerson} = allPersonSlice.actions;
export default allPersonSlice.reducer;