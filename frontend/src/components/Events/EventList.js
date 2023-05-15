import { Link, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../../store/event';
import './EventList.css'
const EventList = () => {
  const eventsObj = useSelector((state) => state.events.allEvents);
  let events
  if (eventsObj) events = Object.values(eventsObj);
  const dispatch = useDispatch();
  let pastEvents = [];
  let upcomingEvents = [];
  if (events) {
    pastEvents = events.filter((event) => new Date(event.startDate) < new Date());
    upcomingEvents = events.filter((event) => new Date(event.startDate) > new Date())
    upcomingEvents = upcomingEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    pastEvents = pastEvents.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }


  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);


  return ((!events || !upcomingEvents || !pastEvents) ? (<div><h1>Loading...</h1></div>) :
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
        {upcomingEvents.map((event) => {
          return (
            <NavLink key={event.groupId} to={`/events/${event.id}`}>
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
        <h2>Past Events ({pastEvents.length})</h2>
        {pastEvents.map((event) => {
          return (
            <NavLink key={event.groupId} to={`/events/${event.id}`}>
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

export default EventList;
