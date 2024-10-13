// App.tsx

import './App.css'
import MiniDrawer from "./components/drawer/SwaMiniDrawer.tsx";
import store from "./store.ts";
import {Provider} from "react-redux";

function App() {
    return (
        <Provider store={store}>
            <MiniDrawer />
        </Provider>
    );
}

export default App;