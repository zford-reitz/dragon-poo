import React from "react";
import {NavLink, Outlet} from "react-router-dom";
import './Layout.css';

const Layout = () => {
    return (
        <>
            <nav>
                <ul>
                    <li>
                        <NavLink to="/">Online</NavLink>
                    </li>
                    <li>
                        <NavLink to="/local">Local</NavLink>
                    </li>
                    <li>
                        <NavLink to="/local-kids">Local Kids</NavLink>
                    </li>
                </ul>
            </nav>
            <Outlet/>
        </>
    );
};

export default Layout;