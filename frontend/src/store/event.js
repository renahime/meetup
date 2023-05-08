/** Action Type Constants: */
export const LOAD_EVENTS = 'events/LOAD_EVENTS';
export const RECEIVE_EVENT = 'events/RECEIVE_EVENT';
export const UPDATE_EVENT = 'events/UPDATE_EVENT';
export const REMOVE_EVENT = 'events/REMOVE_EVENT';

/**  Action Creators: */
export const loadGroups = (events) => ({
  type: LOAD_EVENTS,
  events,
})

export const receiveGroup = (event) => ({
  type:RECEIVE_EVENT,
  event,
})

export const editGroup = (event) => ({
  type:UPDATE_EVENT,
  event
})

export const removeGroup = (eventId) => ({
    type: REMOVE_EVENT,
    eventId,
})

/** Thunk Action Creators: */
export const fetchGroups = () => async(dispatch) => {
  const response = await fetch(`/api/events`, {
    method: 'GET',
  }
  )
  if(response.ok){
    const events = await response.json();
    dispatch(loadGroups(events));
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const fetchGroup = (eventId) => async (dispatch) => {
  const response = await fetch(`/api/events/${eventId}`, {
    method:'GET',
  });
  if(response.ok){
    const event = await response.json();
    dispatch(receiveGroup(event));
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const createGroup = (event) => async (dispatch) => {
  const response = await fetch(`/api/events`, {
    method:'POST',
    headers:{ 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })

  if (response.ok){
    const newGroup = await response.json();
    dispatch(receiveGroup(newGroup));
    return newGroup;
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const updateGroup = (event) => async (dispatch) => {
  const response = await fetch(`/api/events/${event.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });

  if(response.ok) {
    const updatedGroup = await response.json();
    dispatch(editGroup(updatedGroup));
    return updatedGroup;
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const deleteGroup = (eventId) => async (dispatch) => {
  const response = await fetch(`/api/reports/${eventId}`, {
    method:'DELETE',
  });

  if(response.ok) {
    dispatch(removeGroup(eventId));
  } else {
    const errors = await response.json();
    return errors;
  }
}

//** Group Reducer: */
const eventReducer = (state = {}, action) => {
  switch(action.type) {
    case LOAD_EVENTS: {
      const eventsState = {};
      action.events.Events.forEach((event) =>{
        eventsState[event.id] = event;
      })
    return eventsState;
    };
  case RECEIVE_EVENT:
    return {...state, [action.event.id]: action.event};
  case UPDATE_EVENT:
    return {...state, [action.event.id]: action.event};
  case REMOVE_EVENT:
    const newState = {...state};
    delete newState[action.eventId];
    return newState;
  default:
    return state;
  }
}

export default eventReducer;
