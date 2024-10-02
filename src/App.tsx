// App.tsx

import './App.css'
import MiniDrawer from "./components/drawer/SwaMiniDrawer.tsx";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import store from "./store.ts";
import {Provider} from "react-redux";

function App() {
    return (
        <Provider store={store}>
                <Router>
                    <Routes>
                        <Route path="*" element={<MiniDrawer />} />
                    </Routes>
                </Router>
        </Provider>
    );
}

export default App;