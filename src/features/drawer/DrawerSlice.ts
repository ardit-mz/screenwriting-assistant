import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../store.ts";

interface DrawerState {
    openRight: boolean;
}

const initialState: DrawerState = {
    openRight: false,
}

const DrawerSlice = createSlice({
    name: 'drawer',
    initialState,
    reducers: {
        setOpenRight(state, action: PayloadAction<boolean>) {
            state.openRight = action.payload;
        }
    }
})

export const selectOpenRight = (state: RootState) => state.drawer.openRight;

export const {
    setOpenRight,
} = DrawerSlice.actions;

export default DrawerSlice.reducer;