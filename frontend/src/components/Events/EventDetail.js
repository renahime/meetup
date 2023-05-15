import '@fortawesome/fontawesome-free/css/all.css';
import { useState, useEffect, useRef } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvent } from '../../store/event';
import DeleteModal from './EventDelete';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import './EventDetail.css'

const EventDetail = () => {
  const { eventId } = useParams();
  let event = useSelector(state => state.events.singleEvent);
  const sessionUser = useSelector(state => state.session.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const handleAlert = () => {
    alert('Feature coming soon ♥~!')
  };

  useEffect(() => {
    if (!showMenu) return;
    const closeMenu = (e) => {
      setShowMenu(false);
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);


  useEffect(() => {
    dispatch(fetchEvent(eventId));
  }, [dispatch, eventId]);

  if (event && Object.keys(event).length) {
    event.localStart = new Date(event.startDate).toLocaleString();
    event.localEnd = new Date(event.endDate).toLocaleString();
    event.localTimeStart = event.localStart.split(', ');
    event.localTimeEnd = event.localEnd.split(', ');
  }

  console.log(event);

  return (!event || Object.keys(event).length === 0) ? (<div><h1>Loading...</h1></div>) : (
    <div>
      <div className='EventReturn'>
        <Link style={{ display: 'flex', }} to={`/events/`}>
          <i className="fa-solid fa-chevron-left" /> <h4 className="highlight">Events</h4>
        </Link>
      </div>
      <div className='EventHeader'>
        <div>
          <h1>{event.name}</h1>
          <h4>Hosted by {event.Organizer.firstName} {event.Organizer.lastName}</h4>
        </div>
      </div>
      <div className='EventContainer'>
        <div className='EventImage'>
          <img className='ActualEventImage' src={event.previewImage}></img>
        </div>
        <div className='RightSide'>
          <NavLink to={`/groups/${event.groupId}`}>
            <div className='EventGroup'>
              <div className='EventGroupImage'>
                <img src={event.Group.previewImage}></img>
              </div>
              <div className='EventGroupText'>
                <h3>{event.Group.name}</h3>
                <h3>{event.Group.type}</h3>
              </div>
            </div>
          </NavLink>
          <div className='icons-and-Events'>
            <div className='icons'>
              <i style={{ marginTop: '20px', paddingRight: '10px' }} class="fa-solid fa-clock fa-2x"></i>
              <i style={{ marginTop: '22px', paddingRight: '10px' }} class="fa-solid fa-dollar-sign fa-2x"></i>
              <i style={{ paddingBottom: '20px', paddingRight: '10px' }} class="fa-solid fa-map-pin fa-2x"></i>
            </div>
            <div className='EventDetilsText'>
              <h2>START {event.localTimeStart[0]} · {event.localTimeStart[1]}</h2>
              <h2>END {event.localTimeEnd[0]} · {event.localTimeEnd[1]}</h2>
              {event.price !== 0 ? <h2>{event.price}</h2> : <h2>FREE!</h2>}
              <h2>{event.type}</h2>
              <div className='Buttons'>
                {(sessionUser && (event.Organizer.id === sessionUser.id)) ? (
                  <>
                    <div className='EventDetilsText' style={{ listStyle: 'none' }}>
                      <div className='ButtonList'>
                        <div className='Delete'>
                          <button className='actualButton' onClick={handleAlert} >Update</button>
                        </div>
                        <div className='Delete'>
                          <div className='button-background'>
                            <OpenModalMenuItem
                              itemText="DELETE"
                              onItemClick={closeMenu}
                              modalComponent={<DeleteModal
                                event={event} history={history} dispatch={dispatch} open={true} onClose={() => setShowMenu(false)} />}
                              style={{ backgroundColor: '#709874', height: '30px', className: 'owner-button-style' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (sessionUser) ? (
                  <div className='EventDetilsText'>
                    <div className='ButtonList'>
                      <div className='user-buttons'>
                        <button className='actualButton'>Join this Event</button>
                      </div>
                    </div>
                  </div>
                ) : <div></div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='EventDetails'>
        <h2>Details</h2>
        <h2>{event.description}</h2>
      </div>
    </div>
  )
}

export default EventDetail
