import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../store.ts";

interface DrawerState {
    openLeft: boolean;
    openRight: boolean;
    suggestionsFetched: boolean;
    dialogError: boolean;
}

const initialState: DrawerState = {
    openLeft: false,
    openRight: false,
    suggestionsFetched: false,
    dialogError: false,
}

const DrawerSlice = createSlice({
    name: 'drawer',
    initialState,
    reducers: {
        setOpenLeft(state, action: PayloadAction<boolean>) {
            state.openLeft = action.payload;
        },
        setOpenRight(state, action: PayloadAction<boolean>) {
            state.openRight = action.payload;
        },
        setSuggestionsFetched(state, action: PayloadAction<boolean>) {
            state.openRight = action.payload;
        },
        showDialogError(state, action: PayloadAction<boolean>) {
            state.dialogError = action.payload;
        }
    }
})

export const selectOpenLeft = (state: RootState) => state.drawer.openLeft;
export const selectOpenRight = (state: RootState) => state.drawer.openRight;
export const selectSuggestionsFetched = (state: RootState) => state.drawer.suggestionsFetched;
export const selectDialogError = (state: RootState) => state.drawer.dialogError;

export const {
    setOpenLeft,
    setOpenRight,
    setSuggestionsFetched,
    showDialogError,
} = DrawerSlice.actions;

export default DrawerSlice.reducer;