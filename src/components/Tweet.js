import React, {useEffect, useState} from "react";
import {dbService, storageService} from "../fbase";
import {doc, deleteDoc, updateDoc, addDoc, collection, query, orderBy, onSnapshot} from "firebase/firestore";
import {deleteObject, ref} from "firebase/storage"
import Comment from "./Comment";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash, faPencilAlt, faArrowRight, faEyeSlash, faTimes, faCheck} from "@fortawesome/free-solid-svg-icons";

const Tweet = ({tweetObj, isOwner, key, userObj}) => {
    const [editing, setEditing] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [newDetail, setNewDetail] = useState(tweetObj.detail)
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const tweetTextRef = doc(dbService, "tweets", `${tweetObj.id}`);
    const onDeleteClick = async () => {
        const ok = window.confirm("Are you sure you want to delete this post?");
        if (ok) {
            await deleteDoc(tweetTextRef);
            if (tweetObj.attachmentUrl !== "") {
                await deleteObject(ref(storageService, tweetObj.attachmentUrl));
            }
        }
    }
    const onOpenClick = () => setShowDetail((prev) => !prev);
    const toggleEditing = () => setEditing((prev) => !prev);
    const onSubmit = async (event) => {
        event.preventDefault();
        await updateDoc(tweetTextRef, {detail: newDetail});
        setEditing(false);
    }
    const onChange = (event) => {
        const {
            target: {value},
        } = event;
        setNewDetail(value)
    }
    const onChangeComment = (event) => {
        const {
            target: {value}
        } = event;
        setComment(value)
    }
    const onSubmitComment = async (event) => {
        if (comment !== "") {
            event.preventDefault()
            const commentObj = {
                detail: comment, createAt: Date.now(), creatorId: userObj.uid, postId: tweetObj.id
            }
            await addDoc(collection(dbService, 'comments'), commentObj);
            setComment("");
        }
    };
    useEffect(() => {
        const q = query(collection(dbService, 'comments'), orderBy("createAt"));
        onSnapshot(q, (snapshot) => {
            const commentArray = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setComments(commentArray);
        })
    }, []);
    const autoResize = () => {
        document.getElementById("editDetail").style.height = 'auto';
        document.getElementById("editDetail").style.height = document.getElementById("editDetail").scrollHeight + 'px'
    }
    return (<div key={tweetObj.id} className="tweet">
        <div className="tweetTitle" onClick={onOpenClick} style={{width: showDetail ? "87%" : "100%", wordBreak: "break-all", margin: showDetail ? "0 0 10px 0" : "0"}}>
            {tweetObj.title}
        </div>
        {showDetail && (<>
            {editing ? (<>
                <textarea id="editDetail" onKeyUp={autoResize} onKeyDown={autoResize} onClick={autoResize} rows="2" placeholder="Edit Detail" value={newDetail} required={true} onChange={onChange} autoFocus={true} className="formInput tweetDetail"/>
                <div style={{display: "flex", justifyContent: "space-around", fontSize: "15pt"}}>
                    <span onClick={onSubmit}>
                        <FontAwesomeIcon icon={faCheck}/>
                    </span>
                    <span onClick={toggleEditing}>
                        <FontAwesomeIcon icon={faTimes}/>
                    </span>
                </div>
            </>) : (<>
                {tweetObj.attachmentUrl &&
                    <div className="factoryForm__attachment">
                        <img src={tweetObj.attachmentUrl} style={{backgroundImage: tweetObj.attachmentUrl,}}/>
                    </div>
                }
                <div className="tweetDetail" id="detailTextarea" style={{wordBreak: "break-all"}}>{tweetObj.detail}</div>
                <div>
                    {comments.map(comment => (<Comment key={key} postObj={tweetObj} commentObj={comment} isPostOwner={comment.creatorId === tweetObj.creatorId} isOwner={comment.creatorId === userObj.uid}/>))}
                </div>
                <div className="tweetComment">
                    <textarea className="tweetComment" value={comment} onChange={onChangeComment} placeholder="Comment" maxLength={50}/>
                    <span onClick={onSubmitComment}>
                        <FontAwesomeIcon icon={faArrowRight}/>
                    </span>
                </div>
                {isOwner && <div className="tweet__actions">
                    <span onClick={onDeleteClick}>
                        <FontAwesomeIcon icon={faTrash}/>
                    </span>
                    <span onClick={toggleEditing}>
                        <FontAwesomeIcon icon={faPencilAlt}/>
                    </span>
                </div>}
            </>)}
            <div>
                <span onClick={onOpenClick}>
                    <FontAwesomeIcon icon={faEyeSlash}/>
                </span>
            </div>
        </>)}
    </div>);
};

export default Tweet