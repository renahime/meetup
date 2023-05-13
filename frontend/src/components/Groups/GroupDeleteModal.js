import React, { useEffect } from 'react';
import { deleteGroup } from '../../store/group';
export default function DeleteModal({open, onClose, dispatch, group, history}) {
  if(!open) return null;
  const handleDelete = async (e) => {
    e.preventDefault();
    const groupId = await dispatch(deleteGroup(group.id));
    if(groupId){
      history.push('/groups')
    }
  }
  return (<div>
    <h1>Confirm Delete</h1>
    <h3>Are you sure you want to remove this Group?</h3>
    <button onClick={handleDelete}>Yes (Delete Group) </button>
    <button onClick={onClose}>No (Keep Group)</button>
    </div>)
}
