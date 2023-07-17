import React from "react";
import {deleteDoc, doc} from "firebase/firestore";
import {dbService} from "../fbase";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";

const Comment = ({postObj, commentObj, isPostOwner, isOwner}) => {
    const commentTextRef = doc(dbService, "comments", `${commentObj.id}`);
    if (postObj.id === commentObj.postId) {
        const onDelete = async () => {
            const ok = window.confirm("Are you sure you want to delete this comment?");
            if (ok) {
                await deleteDoc(commentTextRef);
            }
        }
        return (<div className="tweetComment" key={commentObj.id}>
                <h6 style={{color : isPostOwner ? "blue" : "black"}}>{commentObj.detail}</h6>
                {isOwner &&
                    <span onClick={onDelete}>
                        <FontAwesomeIcon icon={faTrash}/>
                    </span>}
            </div>);
    }
};

export default Comment