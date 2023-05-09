import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvent } from '../../store/event';

const EventDetail = () => {
  const {eventId} = useParams();
  let event = useSelector(state => state.events[eventId]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);


  useEffect(() => {
      dispatch(fetchEvent(eventId));
      setTimeout(() => {
        setLoading(false);
      }, 1000)
  },[dispatch,eventId]);

  return loading ? (<div><h1>Loading...</h1></div>) : (
  <div>
    <div className='Return'>
      <h4>Events</h4>
    </div>
    <div>
      <h1>{event.name}</h1>
      <h4>Organized by {event.Organizer.firstName} {event.Organizer.lastName}</h4>
    </div>
    <div className='EventContainer'>
      <div className='EventImage'>
        <img src={event.EventImages}></img>
      </div>
      <NavLink to={`/groups/${event.groupId}`}>
      <div className='Group'>
      <img src={event.GroupImage}></img>
        <h3>{event.Group.name}</h3>
      </div>
      </NavLink>
      <div className='GroupText'>
        <h2>Start {event.startDate}</h2>
        <h2>End {event.endDate}</h2>
        <h2>{event.price}</h2>
        <h2>{event.type}</h2>
      </div>
      <div className='EventDetails'>
        <h2>Details</h2>
        <h2>{event.description}</h2>
      </div>
    </div>
  </div>
  )
}

export default EventDetail
