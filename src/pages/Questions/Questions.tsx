import React, { useEffect, useMemo, useState } from "react";

import styles from "./Questions.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { QuestionItem } from "./QuestionItem/QuestionItem";
import { useLocation } from "react-router";
import BlueButton from "../../Components/BlueButton/BlueButton";
import { QuestionInterface } from "../../interface/interface";
import { api } from "../../api/api";
import { useSessionContext } from "../../contexts/SessionContext";
import { toast } from "react-toastify";

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const FILTERS = ["Newest", "Active", "Unanswered", "Frequent", "Votes"];

const Questions = () => {
  const query = useQuery();
  const filter = query.get("tab") ?? "Newest";
  const [questionList, setQuestionList] = useState<QuestionInterface[]>([]);
  const [count, setCount] = useState(0);

  // redirect
  const { userInfo } = useSessionContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo) {
      toast.error("Please sign in first");
      navigate("/login");
    }
  }, [navigate, userInfo]);

  // get data
  useEffect(() => {
    const doIt = async () => {
      try {
        const { results, count } = await api.getQuestionList();
        setQuestionList(results);
        setCount(count);
      } catch (e) {
        // prevent silent error while developing
        console.log(e);
      }
    };
    doIt().then();
  }, [filter]);

  return (
    <div className={styles.questions}>
      <div className={styles.header}>
        <div className={styles.topBar}>
          <h1>All Questions</h1>
          <Link to="/questions/ask">
            <BlueButton text={"Ask Question"} />
          </Link>
        </div>
        <div className={styles.secondBar}>
          <div className={styles.total}>{count} questions</div>
          <div className={styles.filterList}>
            {FILTERS.map((value) => (
              <Link
                className={`${styles.filterItem} ${
                  value === filter ? styles.selected : ""
                }`}
                key={value}
                to={`/questions?tab=${value}`}
              >
                {value}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.questionList}>
        {questionList.map((question) => (
          <QuestionItem key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
};

export default Questions;
