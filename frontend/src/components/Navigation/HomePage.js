import {NavLink} from "react-router-dom"
import './HomePage.css'

function HomeNavigation() {
  return (
    <div className="HomePage">
    <nav className="HomeList">
      <NavLink to="/groups">See All Groups</NavLink>
      <NavLink to="/events">Find an Event</NavLink>
      <NavLink to="/newgroup">Start a new Group</NavLink>
    </nav>
    </div>
  )
}
export default HomeNavigation;
