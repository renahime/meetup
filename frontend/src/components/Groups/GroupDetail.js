import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroup } from '../../store/group';
import { fetchEvents } from '../../store/event';

const GroupDetail = () => {
  const {groupId} = useParams();
  let group = useSelector(state => state.groups[groupId]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  console.log(groupId);

  useEffect(() => {
    dispatch(fetchGroup(groupId));
    setTimeout(() => {
      setLoading(false);
    }, 500)
  },[dispatch,groupId]);



  return loading ? (<div><h1>Loading...</h1></div>) : (
  <div>
    <div className='Return'>
      <h4>Groups</h4>
    </div>
    <div className='GroupContainer'>
      <div className='GroupImage'>
      </div>
      <div className='GroupText'>
        <h1>{group.name}</h1>
        <h2>{group.city},{group.state}</h2>
        <h2>## Events Public</h2>
        <h2>Organized By {group.Organizer.firstName} {group.Organizer.lastName}</h2>
      </div>
      <div className='Organizer'>
        <h2>Organizer</h2>
        <h3>{group.Organizer.firstName} {group.Organizer.lastName}</h3>
      </div>
      <div className='About'>
        <h2>What we're about</h2>
        <h2>{group.about}</h2>
      </div>
      <div className='Events'>
        <h2>Past Events</h2>
        <div className='PastEvents'></div>
      </div>
    </div>
  </div>)
}

export default GroupDetail
