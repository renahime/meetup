import { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroup } from '../../store/group';
import DeleteModal from './GroupDeleteModal';
import { fetchEventsGroupId } from '../../store/event';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Groups.css';

const GroupDetail = () => {
  const {groupId} = useParams();
  let group = useSelector(state => state.groups[groupId]);
  let events = useSelector(state => state.events);
  const sessionUser = useSelector(state => state.session.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchGroup(groupId));
  },[dispatch,groupId]);

  useEffect(() => {
    if(group && group.id){
      dispatch(fetchEventsGroupId(group.id))
    }
  }, [dispatch, group]);

  const eventObj = Object.values(events);

  const pastEvents = eventObj.filter((event) => new Date(event.startDate) > new Date());
  const comingEvents = eventObj.filter((event) => new Date(event.startDate) < new Date());

  return !group && events ? (<div><h1>Loading...</h1></div>) : (
  <div>
    <div className='Return'>
    <Link to={`/groups/`}>
    <i class="fa-solid fa-chevron-left"></i>
    <h4>Groups</h4>
          </Link>
    </div>
    <div className='GroupContainer'>
      <div className='GroupImage'>
      <img src={group.previewImage}></img>
      </div>
      <div className='GroupText'>
        <h1>{group.name}</h1>
        <h2>{group.city},{group.state}</h2>{
          comingEvents.length == 0 ? <h3>0 Upcoming Events</h3> :
          <h3>{comingEvents.length} Events</h3>
        }
        <h2 className='Private'>{group.private}</h2>
        <h2>Organized By {group.Organizer.firstName} {group.Organizer.lastName}</h2>
      </div>
      <div className='Buttons'>
        {(sessionUser && (group.organizerId === sessionUser.id)) ? (
          <>
          <div className='owner-buttons'>
          <Link to={`/groups/${group.id}/events/new`} groupId={group.id}>
          <button>Create Event</button>
          </Link>
          <Link to={`/groups/${group.id}/edit`}>
          <button>Update</button>
           </Link>
          <div className='Delete'>
          <button onClick={() => setIsOpen(true)} >Delete</button>
          <DeleteModal group={group} history={history} dispatch={dispatch} open={isOpen} onClose={() => setIsOpen(false)}>
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
      </div>
      <div className='Organizer'>
        <h2>Organizer</h2>
        <h3>{group.Organizer.firstName} {group.Organizer.lastName}</h3>
      </div>
      <div className='About'>
        <h2>What we're about</h2>
        <h2>{group.about}</h2>
      </div>
      <div className='UpcomingEventDiv'>
        {comingEvents.length == 0 ? <h2>No Upcoming Events</h2> : <h2>Upcoming Events ({comingEvents.length})</h2>}
        {comingEvents.map((event) => {
          return (
            <div className='SingleEvent'>
              <div className='EventImage'>
              <img src={event.previewImage}></img>
              </div>
              <div className='StartDate'>
                <h4>{event.startDate}</h4>
              </div>
              <div className='EventName'>
                <h3>{event.name}</h3>
                </div>
                <div className='EventLocation'>
                  <h6>{group.city},{group.state}</h6>
                </div>
                <div className='EventTitle'>
                  <h3>{event.description}</h3>
                </div>
            </div>
          )
        })}
      </div>
      <div className='PastEventDiv'>
        {pastEvents.length == 0 ? <h2>There are no Past Events</h2> : <h2>Past Events ({pastEvents.length})</h2>}
        {pastEvents.map((event) => {
          return (
            <div className='SingleEvent'>
              <div className='EventImage'>
              <img src={event.previewImage}></img>
              </div>
              <div className='StartDate'>
                <h4>{event.startDate}</h4>
              </div>
              <div className='EventName'>
                <h3>{event.name}</h3>
                </div>
                <div className='EventLocation'>
                  <h6>{group.city},{group.state}</h6>
                </div>
                <div className='EventTitle'>
                  <h3>{event.description}</h3>
                </div>
            </div>
          )
        })}
      </div>
    </div>
)
}

export default GroupDetail
