import { csrfFetch } from "./csrf";

/** Action Type Constants: */
export const LOAD_EVENTS = 'events/LOAD_EVENTS';
export const RECEIVE_EVENT = 'events/RECEIVE_EVENT';
export const UPDATE_EVENT = 'events/UPDATE_EVENT';
export const REMOVE_EVENT = 'events/REMOVE_EVENT';
export const LOAD_BY_GROUP = 'events/LOAD_BY_GROUP';

/**  Action Creators: */
export const loadEvents = (events) => ({
  type: LOAD_EVENTS,
  events,
})

export const receiveEvent = (event) => ({
  type:RECEIVE_EVENT,
  event,
})

export const editEvent = (event) => ({
  type:UPDATE_EVENT,
  event
})

export const removeEvent = (eventId) => ({
    type: REMOVE_EVENT,
    eventId,
})

export const loadEventsByGroup = (events, groupId) => ({
  type:LOAD_BY_GROUP,
  events,
  groupId
})


/** Thunk Action Creators: */
export const fetchEvents = () => async(dispatch) => {
  const response = await fetch(`/api/events`, {
    method: 'GET',
  }
  )
  if(response.ok){
    const events = await response.json();
    dispatch(loadEvents(events));
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const fetchEvent = (eventId) => async (dispatch) => {
  const response = await fetch(`/api/events/${eventId}`, {
    method:'GET',
  });
  if(response.ok){
    const event = await response.json();
    dispatch(receiveEvent(event));
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const createEvent = (event, groupId) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}/events  `, {
    method:'POST',
    credentials: 'same-origin',
    headers:{ 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })


  if (response.ok){
    const newEvent = await response.json();
    dispatch(receiveEvent(newEvent));
    return newEvent;
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const updateEvent = (event) => async (dispatch) => {
  const response = await fetch(`/api/events/${event.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });

  if(response.ok) {
    const updatedEvent = await response.json();
    dispatch(loadEvents(updatedEvent));
    return updatedEvent;
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const deleteEvent = (eventId) => async (dispatch) => {
  const response = await csrfFetch(`/api/events/${eventId}`, {
    credentials: 'same-origin',
    method:'DELETE',
  });

  if(response.ok) {
    dispatch(removeEvent(eventId));
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const fetchEventsGroupId = (groupId) => async (dispatch) => {
  const response = await fetch(`/api/groups/${groupId}/events`, {
    method:'GET'
  });

  if(response.ok) {
    const events = await response.json();
    dispatch(loadEventsByGroup(events, groupId));
  } else {
    const errors = await response.json();
    return errors;
  }
}


//** Event Reducer: */
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
  case LOAD_BY_GROUP: {
    const eventsState = {};
    if (action.events.Events == "There are no events right now") {
      return eventsState;
    }
    const filter = action.events.Events.filter((event) => event.groupId == action.groupId);
    filter.forEach((event) => {
    eventsState[event.id] = event;
    })
    return eventsState;
  }
  default:
    return state;
  }
}

export default eventReducer;
