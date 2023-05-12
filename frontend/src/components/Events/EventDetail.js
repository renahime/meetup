import { useState, useEffect } from 'react';
import { useParams, useHistory,Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvent } from '../../store/event';
import DeleteModal from './EventDelete';

const EventDetail = () => {
  const {eventId} = useParams();
  let event = useSelector(state => state.events[eventId]);
  const sessionUser = useSelector(state => state.session.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);



  useEffect(() => {
      dispatch(fetchEvent(eventId));
  },[dispatch,eventId]);

  return !event ? (<div><h1>Loading...</h1></div>) : (
  <div>
    <div className='Return'>
    <Link to={`/events`}>
    <h4>Events</h4>
    </Link>
    </div>
    <div>
      <h1>{event.name}</h1>
      <h4>Organized by {event.Organizer.firstName} {event.Organizer.lastName}</h4>
    </div>
    <div className='EventContainer'>
      <div className='EventImage'>
        <img src={event.previewImage}></img>
      </div>
      <NavLink to={`/groups/${event.groupId}`}>
      <div className='Group'>
      <img src={event.Group.previewImage}></img>
        <h3>{event.Group.name}</h3>
        <h3>{event.Group.type}</h3>
      </div>
      </NavLink>
      <div className='GroupText'>
        <h2>Start {event.startDate}</h2>
        <h2>End {event.endDate}</h2>
        <h2>{event.price}</h2>
        <h2>{event.type}</h2>
      </div>
      <div className='Buttons'>
        {(sessionUser && (event.Organizer.id === sessionUser.id)) ? (
          <>
          <div className='owner-buttons'>
          <div className='Delete'>
          <button onClick={() => setIsOpen(true)} >Delete</button>
          <DeleteModal event={event} history={history} dispatch={dispatch} open={isOpen} onClose={() => setIsOpen(false)}>
          </DeleteModal>
          </div>
          </div>
          </>
          ) : (sessionUser) ? (
            <>
            <div className='user-buttons'>
              <button>Join this Event</button>
              </div>
              </>
          ) : <div></div>
        }
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
