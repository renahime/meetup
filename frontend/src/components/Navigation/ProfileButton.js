import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import { NavLink, useHistory } from "react-router-dom";
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import './ProfileButtonModal.css'

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();
  const history = useHistory();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    history.push('/')
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      {user && (<>
        <NavLink className="GroupNav" to='/groups/new'>Start a new Group</NavLink>
        <button className="profileButton" onClick={openMenu}>
          <i className="fas fa-user-circle fa-3x" />
        </button>
      </>
      )}
      <ul className={ulClassName} ref={ulRef}>
        {user && (
          <>
            <li>{user.username}</li>
            <li>Hello, {user.firstName} {user.lastName}</li>
            <li>{user.email}</li>
            <li><NavLink className="GroupLink" to='/groups'>View Groups</NavLink></li>
            <li><NavLink className="EventLink" to='/events'>View Events</NavLink></li>
            <li>
              <button onClick={logout}>Log Out</button>
            </li>
          </>
        )}
      </ul>
      <div className="login">
        {!user && (
          <>
            <OpenModalMenuItem
              itemText="LOG IN"
              onItemClick={closeMenu}
              modalComponent={<LoginFormModal />}
            />
            <OpenModalMenuItem
              itemText="SIGN UP"
              onItemClick={closeMenu}
              modalComponent={<SignupFormModal />}
            />
          </>
        )}
      </div>
    </>
  );
}

export default ProfileButton;
