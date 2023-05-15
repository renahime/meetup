// frontend/src/components/Navigation/index.js
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import logo from '../../images/logo.png'
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);
  return (
    <div className='Border'>
      <div className='Header'>
        <Link to='/'>
          <img src={logo} className='logo'></img>
        </Link>
        <ul>
          {/* <li>
        <NavLink exact to="/">Home</NavLink>
      </li> */}
          {isLoaded && (<>
            <li>
              <ProfileButton user={sessionUser} />
            </li>
          </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Navigation;
