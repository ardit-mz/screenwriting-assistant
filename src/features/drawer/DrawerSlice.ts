import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../store.ts";

interface DrawerState {
    openLeft: boolean;
    openRight: boolean;
    suggestionsFetched: boolean;
    dialogError: boolean;
    showConfig: boolean;
    showAdd: boolean;
}

const initialState: DrawerState = {
    openLeft: false,
    openRight: false,
    suggestionsFetched: false,
    dialogError: false,
    showConfig: false,
    showAdd: false,
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
        },
        setShowConfig(state, action: PayloadAction<boolean>) {
            state.showConfig = action.payload;
        },
        setShowAdd(state, action: PayloadAction<boolean>) {
            state.showAdd = action.payload;
        }
    }
})

export const selectOpenLeft = (state: RootState) => state.drawer.openLeft;
export const selectOpenRight = (state: RootState) => state.drawer.openRight;
export const selectSuggestionsFetched = (state: RootState) => state.drawer.suggestionsFetched;
export const selectDialogError = (state: RootState) => state.drawer.dialogError;
export const selectShowConfig = (state: RootState) => state.drawer.showConfig;
export const selectShowAdd = (state: RootState) => state.drawer.showAdd;

export const {
    setOpenLeft,
    setOpenRight,
    setSuggestionsFetched,
    showDialogError,
    setShowConfig,
    setShowAdd,
} = DrawerSlice.actions;

export default DrawerSlice.reducer;