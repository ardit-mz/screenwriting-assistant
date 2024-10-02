import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../store.ts";

interface ModelState {
    model: string;
    apiKey: string;
}

const initialState: ModelState = {
    model: "",
    apiKey: "",
}

const ModelSlice = createSlice({
    name: 'model',
    initialState,
    reducers: {
        setModel(state, action: PayloadAction<{ modelName: string, apiKey: string }>) {
            state.model = action.payload.modelName;
            state.apiKey = action.payload.apiKey;
        },
        setModelName(state, action: PayloadAction<string>) {
            state.model = action.payload;
        },
        setApiKey(state, action: PayloadAction<string>) {
            state.apiKey = action.payload;
        }
    }
})

export const selectModel = (state: RootState) => state.model.model;
export const selectApiKey = (state: RootState) => state.model.apiKey;

export const {
    setModel,
    setModelName,
    setApiKey
} = ModelSlice.actions;

export default ModelSlice.reducer;