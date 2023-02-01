import React from "react";
import {Link, Outlet} from "react-router-dom";

const Layout = () => {
    return (
        <>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Online</Link>
                    </li>
                    <li>
                        <Link to="/local">Local</Link>
                    </li>
                    <li>
                        <Link to="/local-kids">Local Kids</Link>
                    </li>
                </ul>
            </nav>
            <Outlet/>
        </>
    );
};

export default Layout;