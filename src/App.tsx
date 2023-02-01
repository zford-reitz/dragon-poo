import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import LocalApp from './LocalApp';
import DragonPooLobby from './DragonPooLobby';
import Layout from './Layout';
import LocalAppKids from './LocalAppKids';

let app = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<DragonPooLobby/>}/>
                <Route path="local" element={<LocalApp/>}/>
                <Route path="local-kids" element={<LocalAppKids/>}/>
            </Route>
        </Routes>
    </BrowserRouter>
);
export default app;
