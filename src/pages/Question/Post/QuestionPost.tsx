import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import MDEditor from "@uiw/react-md-editor";

import BlueButton from "../../../Components/BlueButton/BlueButton";
import TagItem from "../../../Components/TagItem/TagItem";
import UserCard from "../../../Components/UserCard/UserCard";
import { countVotes, QuestionInterface } from "../../../interface/interface";
import CommentItem from "../CommentItem/CommentItem";
import Vote from "../Vote/Vote";
import { api } from "../../../api/api";
import { useSessionContext } from "../../../contexts/SessionContext";
import { toast } from "react-toastify";

import styles from "./Post.module.scss";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert";

interface PostProps {
  question: QuestionInterface;
  reset: boolean;
  setReset(e: boolean): void;
}

const QuestionPost: React.FC<PostProps> = ({ question, reset, setReset }) => {
  const { userInfo } = useSessionContext();
  const auth = userInfo?.id === question.user.id;
  const [onAdd, setOnAdd] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const navigate = useNavigate();

  const handleCommentSubmit: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    try {
      if (comment === "") {
        toast.error("답변을 입력해주세요!");
        return;
      }
      await api.postQuestionComment(question.id, comment);
      setReset(!reset);
      setOnAdd(false);
      setComment("");
      toast.info("Comment created!");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          toast.error("Please sign in first!");
          navigate("/signin");
        } else if (err.response.status === 400) {
          toast.error("Invalid question id");
        } else console.error(err.response.data);
      } else console.error(err);
    }
  };

  const handleDelete = async () => {
    confirmAlert({
      title: "Confirm",
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await api.deleteQuestion(question.id);
              toast.info("question deleted!");
              navigate(`/questions`);
            } catch (err) {
              if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 400) {
                  toast.error("Invalid question id");
                } else if (err.response.status === 401) {
                  if (userInfo) {
                    toast.error("Cannot delete other user's question");
                  } else {
                    toast.error("Please sign in first");
                    navigate("/signin");
                  }
                }
              } else console.error(err);
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => {},
        },
      ],
    });
  };

  // const addComment = async () => {
  //   try {
  //     if (comment === "") {
  //       toast.error("답변을 입력해주세요!");
  //       return;
  //     }
  //     await api.postQuestionComment(question.id, comment);

  //     // setReset(!reset);
  //     setComment("");
  //     navigate(`/questions/${question.id}`);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  return (
    <div className={styles.questionPostLayout}>
      <div className={styles.voteCell}>
        <Vote
          vote={countVotes(question)}
          questionId={question.id}
          answerId={undefined}
          reset={reset}
          setReset={setReset}
        />
      </div>
      <div className={styles.postCell}>
        <div className={styles.postBody}>
          <MDEditor.Markdown className={styles.body} source={question.body} />
        </div>

        <div className={styles.tagList}>
          {question.tags?.map((tag) => (
            <TagItem key={tag.id} tag={tag.name} />
          ))}
        </div>

        <div className={styles.itemFooter}>
          {auth ? (
            <div className={styles.buttonList}>
              <Link
                to={`/posts/${question.id}/edit`}
                state={{
                  title: question.title,
                  body: question.body,
                  questionId: question.id,
                }}
              >
                <button>Edit</button>
              </Link>
              <button onClick={handleDelete}>Delete</button>
            </div>
          ) : (
            <div />
          )}

          <div className={styles.activityContainer}>
            <UserCard
              user={question.user}
              date={new Date(question.createdAt + "Z")}
              isQuestion={true}
              questionId={question.id}
              isEdited={!!question.updatedAt}
            />
          </div>
        </div>
        <div className={styles.commentList}>
          {question.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              questionId={comment.questionId}
              reset={reset}
              setReset={setReset}
            />
          ))}
        </div>
        {onAdd ? (
          <>
            <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <BlueButton type="submit" text={"Add Comment"} />
            </form>
            <button
              className={styles.cancelComment}
              onClick={() => {
                setOnAdd(!onAdd);
                setComment("");
              }}
            >
              cancel
            </button>
          </>
        ) : (
          <button
            className={styles.addComment}
            onClick={() => {
              setOnAdd(!onAdd);
            }}
          >
            Add a comment
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionPost;
