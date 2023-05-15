import React, { useEffect, useState } from 'react';
import { deleteGroup } from '../../store/group';
import { useModal } from "../../context/Modal";
export default function DeleteModal({ open, onClose, dispatch, group, history }) {

  const { closeModal } = useModal();
  if (!open) return null;
  const handleDelete = async (e) => {
    e.preventDefault();
    const groupId = await dispatch(deleteGroup(group.id)).then(closeModal)
      .catch(history.push('/groups')
      );
    if (groupId) {
      return history.push('/groups')
    }
  }
  return (<div className='modal'>
    <h1 className='modal'>Confirm Delete</h1>
    <h3 className='modal'>Are you sure you want to remove this Group?</h3>
    <button className='modal' onClick={handleDelete}>Yes (Delete Group) </button>
    <button className='modal' onClick={closeModal}>No (Keep Group)</button>
  </div>)
}
