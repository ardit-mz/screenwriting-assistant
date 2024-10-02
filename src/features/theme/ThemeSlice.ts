import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../store.ts";

interface ThemeState {
    mode: boolean;
    blurBackground: boolean;
}

const initialState: ThemeState = {
    mode: false,
    blurBackground: false
}

const ThemeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        handleChangeMode(state, action: PayloadAction<boolean>) {
            state.mode = action.payload;
        },
        handleBlurBackground(state, action: PayloadAction<boolean>) {
            state.blurBackground = action.payload;
        }

    }
})

export const selectMode = (state: RootState) => state.theme.mode;
export const selectBlur = (state: RootState) => state.theme.blurBackground;

export const {
    handleChangeMode,
    handleBlurBackground
} = ThemeSlice.actions;

export default ThemeSlice.reducer;