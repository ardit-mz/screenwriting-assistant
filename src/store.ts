// store.ts

import { configureStore } from '@reduxjs/toolkit';
import ProjectReducer from './features/project/ProjectSlice.ts'
import ThemeReducer from './features/theme/ThemeSlice.ts'
import SnackbarReducer from './features/snackbar/SnackbarSlice.ts'
import ModelReducer from './features/model/ModelSlice.ts'
import DrawerReducer from './features/drawer/DrawerSlice.ts'

const store = configureStore({
    reducer: {
        projects: ProjectReducer,
        theme: ThemeReducer,
        snackbar: SnackbarReducer,
        model: ModelReducer,
        drawer: DrawerReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
