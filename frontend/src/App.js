import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import HomeNavigation from "./components/Navigation/HomePage";
import GroupList from "./components/Groups/GroupList";
import EventList from './components/Events/EventList';
import GroupDetail from './components/Groups/GroupDetail'
import EventDetail from "./components/Events/EventDetail";
import createGroupForm from "./components/GroupForm/CreateGroupForm";
import EditGroupForm from "./components/GroupForm/EditGroupForm";
import CreateEventForm from "./components/EventForm/CreateEventForm"
import "./App.css";
function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <div style={{ backgroundColor: '#f6cde2', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', }}>
      <div id="nav" style={{ borderBottom: 'solid black' }}>
        <Navigation isLoaded={isLoaded} />
        {/* {isLoaded &&
            <Switch>
            </Switch>
          } */}
      </div>
      <div id="content">
        <Switch>
          <Route exact path="/groups" component={GroupList}></Route>
          <Route exact path="/events" component={EventList}></Route>
          <Route exact path="/groups/new" component={createGroupForm}></Route>
          <Route exact path="/groups/:groupId" component={GroupDetail}></Route>
          <Route exact path='/events/:eventId' component={EventDetail}></Route>
          <Route exact path='/groups/:groupId/edit' component={EditGroupForm}></Route>
          <Route exact path='/groups/:groupId/events/new' component={CreateEventForm}></Route>
          <Route exact path="/" component={HomeNavigation}></Route>
        </Switch>
      </div>
    </div>
  );
}

export default App;
