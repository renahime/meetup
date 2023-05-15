import { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom/';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroup } from '../../store/group';
import DeleteModal from './GroupDeleteModal';
import { fetchEventsGroupId } from '../../store/event';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import OpenModalMenuItem from '../OpenModalButton';
import './GroupDetail.css';

const GroupDetail = () => {
  const { groupId } = useParams();
  let group = useSelector(state => state.groups.singleGroup);
  let eventsObj = useSelector(state => state.events.allEvents);
  const sessionUser = useSelector(state => state.session.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);


  useEffect(() => {
    dispatch(fetchGroup(groupId));
  }, [dispatch, groupId]);

  useEffect(() => {
    if (group && group.id) {
      dispatch(fetchEventsGroupId(group.id))
    }
  }, [dispatch, group]);

  let events = [];
  let upcomingEvents = [];
  let pastEvents = [];
  if (eventsObj) {
    events = Object.values(eventsObj);

    pastEvents = events.filter((event) => new Date(event.startDate) < new Date());
    upcomingEvents = events.filter((event) => new Date(event.startDate) > new Date());
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

  const handleAlert = () => {
    alert('Feature coming soon ♥~!')
  }

  const closeMenu = () => setShowMenu(false);

  return (!group || Object.keys(group).length === 0) ? (<div><h1>Loading...</h1></div>) : (
    <div>
      <div className='Return'>

        <Link style={{ display: 'flex', }} to={`/groups/`}>
          <i className="fa-solid fa-chevron-left" /> <h4 className="highlight">Groups</h4>
        </Link>
      </div>
      <div className='GroupContainer'>
        <div className='Intro'>
          <div className='GroupImage'>
            <img className='DetailImage' src={group.previewImage}></img>
          </div>
          <div className='rightSide'>
            <div className='GroupText'>
              <h1>{group.name}</h1>
              <h2>{group.city},{group.state}</h2>{
                upcomingEvents.length == 0 ? <h3>0 Upcoming Events</h3> :
                  <h3>{upcomingEvents.length} Events · {group.private}</h3>
              }
              <h2 className='Private'>{group.private}</h2>
              <h2>Organized By {group.Organizer.firstName} {group.Organizer.lastName}</h2>
            </div>
            <div className='Buttons'>
              {(sessionUser && (group.organizerId === sessionUser.id)) ? (
                <>
                  <div className='owner-buttons' style={{ backgroundColor: '#709874' }}>
                    {/* <OpenModalMenuItem
                      itemText="DELETE"
                      onItemClick={closeMenu}
                      modalComponent={<DeleteModal />}
                    /> */}
                    <Link to={`/groups/${group.id}/events/new`}>
                      <button className='owner-button-style'>Create Event</button>
                    </Link>
                    <Link to={`/groups/${group.id}/edit`}>
                      <button className='owner-button-style'>Update</button>
                    </Link>
                    <div className='Delete'>
                      <button className='owner-button-style' onClick={() => setIsOpen(true)} >Delete</button>
                      <DeleteModal group={group} history={history} dispatch={dispatch} open={isOpen} onClose={() => setIsOpen(false)}>
                      </DeleteModal>
                    </div>
                  </div>
                </>
              ) : sessionUser ? (
                <>
                  <div className='user-buttons'>
                    <button onClick={handleAlert}>Join this Group</button>
                  </div>
                </>
              ) : <></>
              }
            </div>
          </div>
        </div>
      </div>
      <div className='aboutHead'>
        <div className='Organizer'>
          <h2>Organizer</h2>
          <h3 className='highlightName'>{group.Organizer.firstName} {group.Organizer.lastName}</h3>
        </div>
        <div className='About'>
          <h2>What we're about</h2>
          <h2>{group.about}</h2>
        </div>
      </div>
      {upcomingEvents.length == 0 ? <div className='upcomingEventsTitle'><h2>No Upcoming Events</h2></div> : <div className='upcomingEventsTitle'> <h2>Upcoming Events ({upcomingEvents.length})</h2></div>}
      <div className='UpcomingEventDiv'>
        {upcomingEvents.map((event) => {
          return (
            <NavLink to={`/events/${event.id}`} key={event.id}>
              <div className='SingleEventContainer'>
                <div className='SingleEvent'>
                  <div className='ImageFormat'>
                    <div className='EventImage'>
                      <img src={event.previewImage}></img>
                    </div>
                    <div className='EventText'>
                      <div className='StartDate'>
                        <h4>{event.localTimeStart[0]} · {event.localTimeStart[1]}</h4>
                      </div>
                      <div className='EventName'>
                        <h3>{event.name}</h3>
                      </div>
                      <div className='EventLocation'>
                        <h6>{group.city},{group.state}</h6>
                      </div>
                    </div>
                  </div>
                  <div className='EventTitle'>
                    <h3>{event.description}</h3>
                  </div>
                </div>
              </div>
            </NavLink>
          )
        })}
      </div>
      {pastEvents.length == 0 ? <div className='upcomingEventsTitle'> <h2>There are no Past Events</h2> </div> : <div className='upcomingEventsTitle'> <h2>Past Events ({pastEvents.length})</h2></div>}
      <div className='UpcomingEventDiv'>
        {pastEvents.map((event) => {
          return (
            <NavLink to={`/events/${event.id}`} key={event.id}>
              <div className='SingleEventContainer'>
                <div className='SingleEvent'>
                  <div className='ImageFormat'>
                    <div className='EventImage'>
                      <img src={event.previewImage}></img>
                    </div>
                    <div className='EventText'>
                      <div className='StartDate'>
                        <h4>{event.localTimeStart[0]} · {event.localTimeStart[1]}</h4>
                      </div>
                      <div className='EventName'>
                        <h3>{event.name}</h3>
                      </div>
                      <div className='EventLocation'>
                        <h6>{group.city},{group.state}</h6>
                      </div>
                    </div>
                  </div>
                  <div className='EventTitle'>
                    <h3>{event.description}</h3>
                  </div>
                </div>
              </div>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

export default GroupDetail
