import {NavLink, Switch} from "react-router-dom"
import './HomePage.css'
import OpenModalMenuItem from './OpenModalMenuItem';
import SignupFormModal from '../SignupFormModal';
import addGroup from '../../images/addGroup.png';
import eventsIcon from '../../images/eventsIcon.png'
import group from '../../images/homepagebow.png'

function HomeNavigation() {
  return (
    <div className="HomePage">
      <div className="TopHeader">
      <h1 className="HeaderTitle">The idol platform where interests become friendships</h1>
      <h5 className="HeaderBody">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod t
        empor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
        nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
        aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
        nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
         officia deserunt mollit anim id est laborum.</h5>
      <img className="HeaderImage" ></img>
      </div>
      <div className="Mid">
        <h2 className="MidTitle">How イドル-UP! Works</h2>
        <h6 className="MidBody">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.</h6>
      </div>
    <nav className="HomeList">
      <NavLink className="groupLink" to="/groups">
      <img className="groupImageImg" src={group}></img>
      <h6 className="groupText">See All Groups</h6>
        </NavLink>
      <NavLink className="eventLink" to="/events">
      <img className="eventImageImg" src={eventsIcon}></img>
      <h6 className="eventText">Find an Event</h6></NavLink>
      <NavLink className="addGroupLink" to="/groups/new">
      <img className="addGroupImageImg" src={addGroup}></img>
      <h6 className="addGroupText">Start a new Group</h6> </NavLink>
    </nav>
    <div className="JoinButtonDiv" style={{'text-align':'center'}}>
      <button className="JoinButton">
        Join イドル-UP!
      </button>
    </div>
    </div>
  )
}
export default HomeNavigation;
