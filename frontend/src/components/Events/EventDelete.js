import React, { useEffect } from 'react';
import { deleteGroup } from '../../store/group';
export default function DeleteModal({open, onClose, dispatch, event, history}) {
  if(!open) return null;
  const handleDelete = (e) => {
    e.preventDefault();
    dispatch(deleteGroup(event.id));
    history.push('/events')
  }
  return (<div>
    <h1>Confirm Delete</h1>
    <h3>Are you sure you want to remove this Event?</h3>
    <button onClick={handleDelete}>Yes (Delete Event) </button>
    <button onClick={onClose}>No (Keep Group)</button>
    </div>)
}
