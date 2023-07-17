import React from "react";
import {HashRouter as Router, Route, Routes, useNavigate} from "react-router-dom";
import Auth from "routes/Auth";
import Home from "routes/Home";

const AppRouter = ({isLoggedIn, userObj, refreshUser}) => {
    // const navigate = useNavigate();
    return (<Router>
        <Routes>
            {isLoggedIn ?
                (<Route style={{maxWidth: 890, width: "100%", margin: "0 auto", marginTop: 80, display: "flex", justifyContent: "center",}} exact={true} path={"/Home"} element={<Home userObj={userObj}/>}/>
            ) : (<Route exact={true} path={"/"} element={<Auth/>}/>)}
        </Routes>
    </Router>);
};

export default AppRouter;