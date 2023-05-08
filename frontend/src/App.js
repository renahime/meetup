import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import HomeNavigation from "./components/Navigation/HomePage";
import GroupList from "./components/Groups/GroupList";

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
              <Route exact path="/groups">
                <GroupList></GroupList>
              </Route>
            </Switch>
          }
          <HomeNavigation></HomeNavigation>
          </div>
    </div>
  );
}

export default App;
