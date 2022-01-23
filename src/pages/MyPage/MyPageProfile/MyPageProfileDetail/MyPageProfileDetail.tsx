import React, { useMemo } from "react";

import styles from "./MyPageProfileDetail.module.scss";
import ProfilePostItem from "./ProfilePostItem/ProfilePostItem";
import { useSessionContext } from "../../../../contexts/SessionContext";
import { Link } from "react-router-dom";

const MyPageProfileDetail = () => {
  const { userInfo } = useSessionContext();
  const posts = useMemo(
    () =>
      userInfo
        ? userInfo.questions
            .map(({ id, title, createdAt }) => ({
              url: `/questions/${id}`,
              title,
              type: "question",
              createdAt,
            }))
            .concat(
              userInfo.answers.map(
                ({ questionTitle, createdAt, questionId, id }) => ({
                  url: `/questions/${questionId}#answer-${id}`,
                  title: questionTitle,
                  type: "answer",
                  createdAt,
                })
              )
            )
            .sort(({ createdAt: a }, { createdAt: b }) =>
              a > b ? -1 : a < b ? +1 : 0
            )
        : null,
    [userInfo]
  );
  return userInfo ? (
    <div className={styles.myPageProfileDetail}>
      <div className={styles.detailBox}>
        <span className={styles.title}>About</span>
        <div className={`${styles.detailInfo} ${styles.about}`}>
          Your about me section is currently blank. Would you like to &nbsp;
          <Link className={styles.goEdit} to={"/users/me?tab=settings"}>
            add one?
          </Link>
        </div>
      </div>
      <div className={styles.detailBox}>
        <span className={styles.title}>Posts</span>
        <ul
          className={`${styles.detailInfo} ${
            posts?.length ? "" : styles.empty
          }`}
        >
          {posts?.length
            ? posts.map(({ url, title, type, createdAt }) => (
                <ProfilePostItem
                  url={url}
                  title={title}
                  type={type}
                  createdAt={createdAt}
                  key={url}
                />
              ))
            : "no posts"}
        </ul>
      </div>
    </div>
  ) : null;
};

export default MyPageProfileDetail;
