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
  type:RECEIVE_GROUP,
  group,
})

export const editGroup = (group) => ({
  type:UPDATE_GROUP,
  group
})

export const removeGroup = (groupId) => ({
    type: REMOVE_GROUP,
    groupId,
})

/** Thunk Action Creators: */
export const fetchGroups = () => async(dispatch) => {
  const response = await fetch(`/api/groups`, {
    method: 'GET',
  }
  )
  if(response.ok){
    const groups = await response.json();
    dispatch(loadGroups(groups));
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const fetchGroup = (groupId) => async (dispatch) => {
  const response = await fetch(`/api/groups/${groupId}`, {
    method:'GET',
  });
  if(response.ok){
    const group = await response.json();
    dispatch(receiveGroup(group));
  } else {
    const errors = await response.json();
    return errors;
  }
}

export const createGroup = (group) => async (dispatch) => {
  const response = await fetch(`/api/groups`, {
    method:'POST',
    headers:{ 'Content-Type': 'application/json' },
    body: JSON.stringify(group),
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

export const updateGroup = (group) => async (dispatch) => {
  const response = await fetch(`/api/groups/${group.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(group)
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

//** Group Reducer: */
const groupReducer = (state = {}, action) => {
  switch(action.type) {
    case LOAD_GROUPS: {
      const groupsState = {};
      action.groups.forEach((group) =>{
        groupsState[group.id] = group;
      })
    };
    return groupsState;
  case RECEIVE_GROUP:
    return {...state, [action.group.id]: action.group};
  case UPDATE_REPORT:
    return {...state, [action.group.id]: action.group};
  case REMOVE_GROUP:
    const newState = {...state};
    delete newState[action.groupId];
    return newState;
  default:
    return state;
  }
}

export default groupReducer;
