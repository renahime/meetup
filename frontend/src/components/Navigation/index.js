// frontend/src/components/Navigation/index.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import logo from '../../images/logo.png'
import './Navigation.css';

function Navigation({ isLoaded }){
  const sessionUser = useSelector(state => state.session.user);
  console.log(isLoaded);
  console.log(sessionUser)
  return (
    <div className='Border'>
    <div className='Header'>
    <img src={logo} className='logo'></img>
    <ul>
      {/* <li>
        <NavLink exact to="/">Home</NavLink>
      </li> */}
      {isLoaded && (
        <li>
          <ProfileButton user={sessionUser} />
        </li>
      )}
    </ul>
    </div>
    </div>
  );
}

export default Navigation;
