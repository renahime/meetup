import { NavLink, Switch } from "react-router-dom"
import './HomePage.css'
import OpenModalMenuItem from './OpenModalMenuItem';
import { useSelector, useDispatch } from 'react-redux';
import SignupFormModal from '../SignupFormModal';
import addGroup from '../../images/addGroup.png';
import eventsIcon from '../../images/eventsIcon.png'
import group from '../../images/homepagebow.png'
import info from '../../images/infographic.png'

function HomeNavigation() {

  const sessionUser = useSelector(state => state.session.user);

  return (
    <div className="HomePage">
      <div className="TopHeader">
        <div className="TopHeaderText">
          <h1 className="HeaderTitle">The idol platform where interests become friendships</h1>
          <h5 className="HeaderBody">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod t
            empor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
            aute irure dolor</h5>
        </div>
        <img className="HeaderImage" src={info}></img>
      </div>
      <div className="Mid">
        <h2 className="MidTitle">How イドル-UP! Works</h2>
        <h4 className="MidBody">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed </h4>
      </div>
      <nav className="HomeList">
        <NavLink className="groupLink" to="/groups">
          <img className="groupImageImg" src={group}></img>
          <h6 className="groupText">See All Groups</h6>
        </NavLink>
        <NavLink className="eventLink" to="/events">
          <img className="eventImageImg" src={eventsIcon}></img>
          <h6 className="eventText">Find an Event</h6></NavLink>
        {sessionUser ? (<NavLink className="addGroupLink" to="/groups/new">
          <img className="addGroupImageImg" src={addGroup}></img>
          <h6 className="addGroupText">Start a new Group</h6> </NavLink>) : (<div><img className="addGroupImageImg" src={addGroup}></img>
            <h6 className="addGroupText">Start a new Group</h6></div>)}
      </nav>
      <div className="JoinButtonDiv" style={{ textAlign: 'center' }}>
        <button className="JoinButton">
          Join イドル-UP!
        </button>
      </div>
    </div>
  )
}
export default HomeNavigation;
