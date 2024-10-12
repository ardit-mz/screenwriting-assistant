// App.tsx

import './App.css'
import MiniDrawer from "./components/drawer/SwaMiniDrawer.tsx";
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import store from "./store.ts";
import {Provider} from "react-redux";

function App() {
    return (
        <Provider store={store}>
                <Router>
                    <Routes>
                        <Route path="*" element={<MiniDrawer />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Router>
        </Provider>
    );
}

export default App;