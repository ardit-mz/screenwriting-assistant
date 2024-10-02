import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../store.ts";

interface SnackbarState {
    dndOptionShown: boolean;
}

const initialState: SnackbarState = {
    dndOptionShown: false,
}

const SnackbarSlice = createSlice({
    name: 'snackbar',
    initialState,
    reducers: {
        setDndOptionShown(state, action: PayloadAction<boolean>) {
            state.dndOptionShown = action.payload;
        },
    }
})

export const selectDndOptionShown = (state: RootState) => state.snackbar.dndOptionShown;

export const {
    setDndOptionShown,
} = SnackbarSlice.actions;

export default SnackbarSlice.reducer;