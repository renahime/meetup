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
import GroupForm from "./components/GroupForm/GroupForm";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <div>
          <div>
            <Navigation isLoaded={isLoaded} />
            {isLoaded &&
            <Switch>
            </Switch>
          }
          </div>
          <div>
          <Switch>
              <Route exact path="/groups" component={GroupList}></Route>
              <Route exact path="/events" component={EventList}></Route>
              <Route exact path="/groups/new" component={GroupForm}></Route>
              <Route path="/groups/:groupId" component={GroupDetail}></Route>
              <Route path='/events/:eventId' component={EventDetail}></Route>
            </Switch>
          </div>
          <div>
            <Switch>
              <Route exact path="/">
              <HomeNavigation></HomeNavigation>
              </Route>
            </Switch>
          </div>
    </div>
  );
}

export default App;
