import React, { useState } from "react";

import styles from "./Register.module.scss";
import OAuthLogin from "../../Components/OAuthLogin/OAuthLogin";
import LabelInput from "../../Components/LabelInput/LabelInput";
import { Link, Navigate } from "react-router-dom";
import BlueButton from "../../Components/BlueButton/BlueButton";
import { useSessionContext } from "../../contexts/SessionContext";
import axios from "axios";
import { toast } from "react-toastify";

type RegisterInfo = {
  [key: string]: string;
  name: string;
  email: string;
  password: string;
};

const Register = () => {
  const [registerInfo, setRegisterInfo] = useState<RegisterInfo>({
    name: "",
    email: "",
    password: "",
  });

  const [warningOn, setWarningOn] = useState<boolean>(false);

  const { userInfo, signup } = useSessionContext();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "password") {
      setWarningOn(true);
    }

    const newRegisterInfo = { ...registerInfo, [name]: value };
    setRegisterInfo(newRegisterInfo);
  };

  const submit = async () => {
    if (registerInfo.name === "") toast.error("Name is empty");
    else if (
      !registerInfo.email.match(
        /^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      )
    )
      toast.error("Invalid email format");
    else if (registerInfo.password === "") toast.error("Password is empty");
    else {
      try {
        await signup(
          registerInfo.name,
          registerInfo.email,
          registerInfo.password
        );
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.response) {
            if (e.response.status === 400) {
              toast.error("Invalid email format");
            } else if (e.response.status === 401) {
              toast.error("Invalid email or password");
            } else if (e.response.status === 409) {
              toast.error("Account with the same email already exists");
            } else {
              console.error(e.response.status, e.response.data);
            }
          }
        } else {
          console.error(e);
        }
      }
    }
  };

  return userInfo ? (
    <Navigate to={"/questions"} replace />
  ) : (
    <div className={styles.register}>
      <img
        className={styles.logoImage}
        src={process.env.PUBLIC_URL + "/logo.png"}
        alt={"logo"}
      />
      <OAuthLogin />
      <form
        className={styles.registerBox}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <LabelInput
          title={"Display name"}
          name={"name"}
          value={registerInfo.name}
          type={"text"}
          onChange={onChange}
        />
        <LabelInput
          title={"Email"}
          name={"email"}
          type={"email"}
          value={registerInfo.email}
          onChange={onChange}
        />
        <LabelInput
          title={"Password"}
          name={"password"}
          type={"password"}
          value={registerInfo.password}
          onChange={onChange}
        />
        <span
          className={`${styles.warning} ${warningOn ? styles.warningOn : ""}`}
        >
          * 6~15자, 숫자, 문자, 특수문자 중 2가지 이상
        </span>
        <div className={styles.buttonLine}>
          <BlueButton type={"submit"} text={"Sign up"} onClick={submit} />
        </div>
      </form>
      <div className={styles.additional}>
        <span>Already have an account? </span>
        <Link className={styles.linkToLogin} to={"/login"}>
          Log in
        </Link>
      </div>
    </div>
  );
};

export default Register;
