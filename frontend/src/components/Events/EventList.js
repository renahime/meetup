import { Link, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../../store/event';
import './EventList.css'
const GroupList = () => {
  const eventsObj =  useSelector((state) => state.events);
  const events = Object.values(eventsObj);
  const dispatch = useDispatch();

  console.log(events)
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  console.log(events)

  return(
    <div>
    <div className='Headers'>
    <Link to='/events'>Events
    </Link>
    <Link to='/groups'>Groups</Link>
    </div>
    <div className='Title'>
    <h3>Events In Meetup</h3>
    </div>
    <div className='GroupList'>
      {events.map((event) => {
        return(
        <NavLink path to={`/events/${event.id}`}>
        <div className='Event'>
          <div className='ImageContainer'>
            <img src={event.previewImage}></img>
            </div>
            <div className='TextContainer'>
              <h1 className='EventDate'>{event.startDate}</h1>
              <h2 className='EventName'>{event.name}</h2>
              <h2 className='EventLocation'>{event.Group.city},{event.Group.state}</h2>
              </div>
            <div className='EventDescription'>
            <h3 className='GroupDescription'>{event.description}</h3>
              </div>
          </div>
          </NavLink>)
      })}
    </div>
    </div>
  )
}

export default GroupList;
