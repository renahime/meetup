// frontend/src/components/LoginFormModal/index.js
import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();
  const demoUser = 'Muse1';
  const demoPass = 'password';

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  const handleDemo = (e) => {
    e.preventDefault();
    setErrors({})
    let credential = demoUser;
    let password = demoPass
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        console.log(data);
        if (data && data.errors) {
          setErrors(data.errors);
        }
      })
  }

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential && (
          <p>{errors.credential}</p>
        )}
        <button type="submit" disabled={(credential.length < 4 || password.length < 6)}>Log In</button>
      </form>
      <form onSubmit={handleDemo}>
        <button type="submit"
        >
          Sign is as Demo User
        </button>
      </form>
    </>
  );
}

export default LoginFormModal;
