import React, { useEffect, useState } from 'react';
import { deleteEvent } from '../../store/event';
import { useModal } from "../../context/Modal";
export default function DeleteModal({ open, onClose, dispatch, event, history }) {

  const { closeModal } = useModal();
  if (!open) return null;
  const handleDelete = async (e) => {
    e.preventDefault();
    const eventId = await dispatch(deleteEvent(event.id)).then(closeModal)
      .catch(history.push(`/groups/${event.groupId}`)
      );
    if (eventId) {
      return history.push(`/groups/${event.groupId}`)
    }
  }
  return (<div className='modal'>
    <h1 className='modal'>Confirm Delete</h1>
    <h3 className='modal'>Are you sure you want to remove this Event?</h3>
    <button className='modal' onClick={handleDelete}>Yes (Delete Event) </button>
    <button className='modal' onClick={closeModal}>No (Keep Event)</button>
  </div>)
}
