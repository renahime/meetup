import { csrfFetch } from "./csrf";

/** Action Type Constants: */
export const LOAD_GROUPS = 'groups/LOAD_GROUPS';
export const RECEIVE_GROUP = 'groups/RECEIVE_GROUP';
export const UPDATE_GROUP = 'groups/UPDATE_GROUP';
export const REMOVE_GROUP = 'groups/REMOVE_GROUP';

/**  Action Creators: */
export const loadGroups = (groups) => ({
  type: LOAD_GROUPS,
  groups,
})

export const receiveGroup = (group) => ({
  type: RECEIVE_GROUP,
  group,
})

export const editGroup = (group) => ({
  type: UPDATE_GROUP,
  group
})

export const removeGroup = (groupId) => ({
  type: REMOVE_GROUP,
  groupId,
})


/** Thunk Action Creators: */
export const fetchGroups = () => async (dispatch) => {
  const response = await fetch(`/api/groups`, {
    method: 'GET',
  }
  )
  if (response.ok) {
    const groups = await response.json();
    dispatch(loadGroups(groups));
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const fetchGroup = (groupId) => async (dispatch) => {
  const response = await fetch(`/api/groups/${groupId}`, {
    method: 'GET',
  });
  if (response.ok) {
    const group = await response.json();
    dispatch(receiveGroup(group));
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const createGroup = (group) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(group),
  })

  if (response.ok) {
    const newGroup = await response.json();
    dispatch(receiveGroup(newGroup));
    return newGroup;
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const updateGroup = (group) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${group.id}`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(group)
  });

  if (response.ok) {
    const updatedGroup = await response.json();
    dispatch(editGroup(updatedGroup));
    return updatedGroup;
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const deleteGroup = (groupId) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}`, {
    credentials: 'same-origin',
    method: 'DELETE',
  });

  // console.log(response);

  if (response.ok) {
    dispatch(removeGroup(groupId));
    return groupId;
  } else {
    const errors = await response.json();
    return errors;
  }
}

let initialState = { allGroups: null, singleGroup: null }

//** Group Reducer: */
const groupReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_GROUPS: {
      const groupsState = { ...state, allGroups: { ...state.allGroups }, singleGroup: { ...state.singleGroup } }
      action.groups.Groups.forEach((group) => {
        groupsState.allGroups[group.id] = group;
      })
      return groupsState;
    };
    case RECEIVE_GROUP:
      let groupsState = { ...state, allGroups: { ...state.allGroups }, singleGroup: { ...state.singleGroup } };
      groupsState.singleGroup = action.group;
      return groupsState;
    case UPDATE_GROUP: {
      let groupsState = { ...state, allGroups: { ...state.allGroups }, singleGroup: { ...state.singleGroup } };
      groupsState.allGroups[action.group.id] = action.group;
      return groupsState
    }
    case REMOVE_GROUP: {
      const groupsState = { ...state, allGroups: { ...state.allGroups }, singleGroup: { ...state.singleGroup } };
      delete groupsState.allGroups[action.groupId];
      return groupsState;
    }
    default:
      return state;
  }
}

export default groupReducer;
