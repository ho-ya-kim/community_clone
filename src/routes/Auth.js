import React, {useState} from "react";
import {authService} from "fbase";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTwitter} from "@fortawesome/free-brands-svg-icons";

const Auth = () => {
    const [provider, setProvider] = useState("");
    const [password, setPassword] = useState("");
    const [newAccount, setNewAccount] = useState(true);
    const [error, setError] = useState("");
    let regex = new RegExp('gbs.s+[0-9]+@ggh.goe.go.kr')
    const onChange = (event) => {
        const {target: {name, value}} = event;
        if (name === "provider") {
            setProvider(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };
    const onSubmit = async (event) => {
        event.preventDefault();
        try {
            if (regex.test(provider)) {
                if (newAccount) {
                    await authService.createUserWithEmailAndPassword(provider, password);
                } else {
                    await authService.signInWithEmailAndPassword(provider, password);
                }
            }
        } catch (error) {
            setError(error.message)
        }
    };
    const toggleAccount = () => setNewAccount((prev) => !prev)
    return (<div className="authContainer">
        <form onSubmit={onSubmit} className="container">
            <input
                name="provider"
                type="text"
                placeholder="provider"
                required
                value={provider}
                onChange={onChange}
                className="authInput"
            />
            <input
                name="password"
                type="password"
                placeholder="password"
                required
                value={password}
                onChange={onChange}
                className="authInput"
            />
            <input
                type="submit"
                value={newAccount ? "Create Account" : "Sign In"}
                className="authInput authSubmit"
            />
            {error && <span className="authError">{error}</span>}
            <span onClick={toggleAccount} className="authSwitch" style={{textAlign: "center"}}>
                {newAccount ? "Sign In" : "Create Account"}
            </span>
        </form>
    </div>);
}
export default Auth;