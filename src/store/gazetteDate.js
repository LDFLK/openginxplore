import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    gazetteData: {},
    gazetteDataClassic: []
}

const gazetteSlice = createSlice({
    name: 'gazettes',
    initialState,
    reducers: {
        setGazetteData(state, action){
            state.gazetteData = action.payload;
        },
        setGazetteDataClassic(state, action){
            state.gazetteDataClassic = action.payload
        }
    }
})

export const {setGazetteData, setGazetteDataClassic} = gazetteSlice.actions;
export default gazetteSlice.reducer;