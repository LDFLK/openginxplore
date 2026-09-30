import { createSlice } from "@reduxjs/toolkit"

// `gazetteData` is the president/range-filtered dot list rendered by
// GazetteTimeline. The unfiltered list comes from the `usePresidents` hook.
const initialState = {
    gazetteData: []
}

const gazetteSlice = createSlice({
    name: 'gazettes',
    initialState,
    reducers: {
        setGazetteData(state, action){
            state.gazetteData = action.payload;
        }
    }
})

export const {setGazetteData} = gazetteSlice.actions;
export default gazetteSlice.reducer;