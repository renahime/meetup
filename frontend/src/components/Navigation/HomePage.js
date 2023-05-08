import {NavLink} from "react-router-dom"

function HomeNavigation() {
  return (
    <nav>
      <NavLink to="/groups">See All Groups</NavLink>
      <NavLink to="/events">Find an Event</NavLink>
      <NavLink to="/newgroup">Start a new Group</NavLink>
    </nav>
  )
}
export default HomeNavigation;
