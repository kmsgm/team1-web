import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { QuestionComment, AnswerComment } from "../../../interface/interface";

import { ReactComponent as Edit } from "../../../icons/iconEdit.svg";
import { ReactComponent as Delete } from "../../../icons/iconDelete.svg";
import dayjs from "dayjs";

import styles from "./CommentItem.module.scss";
import { api } from "../../../api/api";
import BlueButton from "../../../Components/BlueButton/BlueButton";
import { useSessionContext } from "../../../contexts/SessionContext";
import { toast } from "react-toastify";
import axios from "axios";

interface CommentProps {
  comment: QuestionComment | AnswerComment;
  questionId: number;
  reset: boolean;
  setReset(e: boolean): void;
  answerId?: number;
}

const CommentItem: React.FC<CommentProps> = ({
  comment,
  questionId,
  answerId,
  reset,
  setReset,
}) => {
  const date = new Date();
  const { userInfo } = useSessionContext();
  const auth = userInfo?.id === comment.user.id;
  const [onEdit, setOnEdit] = useState<boolean>(false);
  const [edited, setEdited] = useState<string>("");
  const navigate = useNavigate();

  const handleEdit = () => {
    setOnEdit(!onEdit);
    setEdited(comment.body);
  };

  const handleDelete = async () => {
    if (questionId) {
      try {
        answerId
          ? await api.deleteAnswerComment(comment.id)
          : await api.deleteQuestionComment(comment.id);
        setReset(!reset);
        toast.info("Comment deleted!");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status === 400) {
              toast.error("Invalid comment id");
            } else if (err.response.status === 401) {
              if (userInfo) {
                toast.error("Cannot remove other user's comment");
              } else {
                toast.error("Please sign in first");
                navigate("/signin");
              }
            } else if (err.response.status === 404) {
              toast.error("The comment does not exist");
            } else console.error(err.response.data);
          } else console.error(err);
        } else console.error(err);
      }
    }
  };

  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    if (questionId) {
      try {
        answerId
          ? await api.editAnswerComment(comment.id, edited)
          : await api.editQuestionComment(comment.id, edited);
        setReset(!reset);
        setOnEdit(false);
        setEdited("");
        toast.info("Comment edited!");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status === 400) {
              toast.error("Invalid comment id or content");
            } else if (err.response.status === 401) {
              toast.error("Please sign in first");
            } else if (err.response.status === 404) {
              toast.error("The comment does not exist");
            } else console.error(err.response.data);
          } else console.error(err);
        } else console.error(err);
      }
    }
  };

  return (
    <>
      <div className={styles.commentContent}>
        <span />
        {onEdit ? (
          <div>
            <form onSubmit={handleEditSubmit}>
              <textarea
                value={edited}
                onChange={(e) => setEdited(e.target.value)}
              />
              <BlueButton type="submit" text={"Save edits"} />
            </form>
            <button
              className={styles.cancelEdit}
              onClick={() => setOnEdit(!onEdit)}
            >
              cancel
            </button>
          </div>
        ) : (
          <>
            <p>{comment.body}</p>
            <label>
              <p>–</p>
              <Link to={`/users/${comment.user.id}`}>
                <button className={styles.username}>
                  {" "}
                  {comment.user.username}
                </button>
              </Link>
              <p className={styles.date}>
                {dayjs(date).format("MMM DD 'YY")} at{" "}
                {dayjs(date).format("HH:mm")}
              </p>
            </label>{" "}
          </>
        )}

        {auth && !onEdit && (
          <>
            <button onClick={handleEdit}>
              <Edit className={styles.editButton} />
            </button>
            <button onClick={handleDelete}>
              <Delete className={styles.deleteButton} />
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default CommentItem;
