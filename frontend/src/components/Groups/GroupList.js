import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../../store/group';

const GroupList = () => {
  const groups = Object.values(
    useSelector((state) => (state.groups ? state.groups : []))
  )
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroups());
  }, dispatch);
}

export default GroupList;
