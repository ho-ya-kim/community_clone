import React, {useEffect, useState} from "react";
import {authService, dbService, storageService} from "fbase";
import Tweet from "../components/Tweet";
import {collection, onSnapshot, query, orderBy, addDoc} from "firebase/firestore";
import {getDownloadURL, ref, uploadString} from "firebase/storage";
import {v4} from "uuid";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";

const Home = ({userObj}) => {
    const navigate = useNavigate();
    const [tweets, setTweets] = useState([]);
    const [tweet, setTweet] = useState({title: "", detail: ""});
    const [attachment, setAttachment] = useState("");
    const onSubmit = async (event) => {
        if (tweet.detail !== "") {
            event.preventDefault();
            let attachmentUrl = "";
            if (attachment !== "") {
                const attachmentRef = ref(storageService, `${userObj.uid}/${v4()}`);
                const response = await uploadString(attachmentRef, attachment, "data_url");
                attachmentUrl = await getDownloadURL(response.ref);
            }
            const tweetObj = {
                title: tweet.title, detail: tweet.detail, createAt: Date.now(), creatorId: userObj.uid, attachmentUrl,
            }
            await addDoc(collection(dbService, "tweets"), tweetObj);
            setTweet({title: "", detail: ""});
            setAttachment("");
        }
    };
    const onChangeTitle = (event) => {
        const {
            target: {value},
        } = event;
        setTweet({title: value, detail: tweet.detail})
    }
    const onChangeDetail = (event) => {
        const {
            target: {value},
        } = event;
        setTweet({title: tweet.title, detail: value})
    }
    const onFileChange = (event) => {
        const {target: {files}} = event;
        const theFile = files[0];
        const reader = new FileReader();
        reader.onloadend = (finishedEvent) => {
            const {currentTarget: {result}} = finishedEvent;
            setAttachment(result)
        }
        reader.readAsDataURL(theFile);
    }
    const onClearAttachment = () => {
        setAttachment("")
        document.getElementById("attach-file").value = "";
    };
    useEffect(() => {
        const q = query(collection(dbService, 'tweets'), orderBy("createAt"));
        onSnapshot(q, (snapshot) => {
            const tweetArray = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setTweets(tweetArray);
        })
    }, []);

    const autoResizeTitle = () => {
        document.getElementById("input_title").style.height = 'auto';
        document.getElementById("input_title").style.height = document.getElementById("input_title").scrollHeight + 'px'
    }
    const autoResizeDetail = () => {
        document.getElementById("input_detail").style.height = 'auto';
        document.getElementById("input_detail").style.height = document.getElementById("input_detail").scrollHeight + 'px'
    }
    const onLogOutClick = () => {
        authService.signOut();
        navigate("/");
    };

    document.addEventListener("DOMContentLoaded", (event) => {
        const arrTop = document.getElementById("factoryInput_label_id").offsetTop - document.getElementById("factoryInput_id").offsetTop - document.getElementById("factoryInput_id").offsetHeight;
        document.getElementById("factoryInput_id").style.top = arrTop + 'px';
    })

    return (
        <>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "100px"}}>
                <div style={{margin: "10px 0 15px 0"}}>
                <span className="formBtn cancelBtn logOut" onClick={onLogOutClick}>
                    Log Out
                </span>
                </div>
                <div className="container">
                    <form onSubmit={onSubmit} className="factoryForm">
                        <div className="factoryInput__container">
                            <div className="factoryInput__input" style={{padding: "10px"}}>
                                <textarea className="homeInput tweetTitle" id="input_title" onKeyUp={autoResizeTitle} onKeyDown={autoResizeTitle} rows="2" value={tweet.title} onChange={onChangeTitle} placeholder="Title" maxLength={50}/>
                                <textarea className="homeInput tweetDetail" id='input_detail' onKeyUp={autoResizeDetail} onKeyDown={autoResizeDetail} rows="3" value={tweet.detail} onChange={onChangeDetail} placeholder="Detail" maxLength={1200}/>
                            </div>
                            <input type="submit" value="Post" className="factoryInput__arrow" id="factoryInput_id"/>
                        </div>
                        <label htmlFor="attach-file" className="factoryInput__label" id="factoryInput_label_id">
                            <span>Add photos</span>
                            <FontAwesomeIcon icon={faPlus}/>
                        </label>
                        <input id="attach-file" type="file" accept="image/*" onChange={onFileChange} style={{opacity: 0,}}/>
                        {attachment && (<div className="factoryForm__attachment">
                            <img src={attachment} style={{backgroundImage: attachment,}}/>
                            <label className="factoryForm__clear" onClick={onClearAttachment}>
                                <span>Remove</span>
                                <FontAwesomeIcon icon={faTimes}/>
                            </label>
                        </div>)}
                    </form>
                    <div style={{marginTop: 30}}>
                        {tweets.map(tweet => (<Tweet key={tweet.id} tweetObj={tweet} isOwner={tweet.creatorId === userObj.uid} creatorId={tweet.creatorId} userObj={userObj}/>))}
                    </div>
                </div>
            </div>
        </>);
};
export default Home;