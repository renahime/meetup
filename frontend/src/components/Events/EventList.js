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
  if (events && Object.keys(events).length) {
    pastEvents = events.filter((event) => new Date(event.startDate) < new Date());
    upcomingEvents = events.filter((event) => new Date(event.startDate) > new Date())
    upcomingEvents = upcomingEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    pastEvents = pastEvents.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    upcomingEvents.forEach((event) => {
      event.localStart = new Date(event.startDate).toLocaleString();
      event.localEnd = new Date(event.endDate).toLocaleString();
      event.localTimeStart = event.localStart.split(', ');
      event.localTimeEnd = event.localEnd.split(', ');
    })

    pastEvents.forEach((event) => {
      event.localStart = new Date(event.startDate).toLocaleString();
      event.localEnd = new Date(event.endDate).toLocaleString();
      event.localTimeStart = event.localStart.split(', ');
      event.localTimeEnd = event.localEnd.split(', ');
    })
  }


  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);


  return ((!events || !upcomingEvents || !pastEvents) ? (<div><h1>Loading...</h1></div>) :
    <div className='MainDiv'>
      <div className='Headers'>
        <Link to='/events' className='highlight'><h1>Events</h1>
        </Link>
        <Link to='/groups'><h1>Groups</h1></Link>
      </div>
      <div className='Title'>
        <h3>Events In Meetup</h3>
      </div>
      <div className='GroupList'>
        {upcomingEvents.map((event) => {
          return (
            <NavLink key={event.groupId} to={`/events/${event.id}`}>
              <div className='Event'>
                <div className='MainEventDiv'>
                  <div className='MainTextContainer'>
                    <div className='ImageContainer'>
                      <img className="Image" src={event.previewImage}></img>
                    </div>
                    <div className='TextContainer'>
                      <h1 className='EventDate'>{event.localTimeStart[0]} · {event.localTimeStart[1]}</h1>
                      <h2 className='EventName'>{event.name}</h2>
                      <h2 className='EventLocation'>{event.Group.city},{event.Group.state}</h2>
                    </div>
                  </div>
                </div>
                <div className='EventDescription'> <h3 className='GroupDescription'>{event.description}</h3>
                </div>
              </div>
            </NavLink>)
        })}
        <h1 style={{ paddingTop: '60px', borderBottom: "solid black", paddingBottom: '20px', color: '#b67295' }}>Past Events ({pastEvents.length})</h1>
        {pastEvents.map((event) => {
          return (
            <NavLink key={event.groupId} to={`/events/${event.id}`}>
              <div className='Event'>
                <div className='MainEventDiv'>
                  <div className='MainTextContainer'>
                    <div className='ImageContainer'>
                      <img className="Image" src={event.previewImage}></img>
                    </div>
                    <div className='TextContainer'>
                      <h1 className='EventDate'>{event.localTimeStart[0]} · {event.localTimeStart[1]}</h1>
                      <h2 className='EventName'>{event.name}</h2>
                      <h2 className='EventLocation'>{event.Group.city},{event.Group.state}</h2>
                    </div>
                  </div>
                </div>
                <div className='EventDescription'> <h3 className='GroupDescription'>{event.description}</h3>
                </div>
              </div>
            </NavLink>)
        })}

      </div>
    </div>
  )
}

export default EventList;
