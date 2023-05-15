import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../../store/group';
import './Groups.css';
import { NavLink, Route } from 'react-router-dom';
import { fetchEvents } from '../../store/event';

const GroupList = () => {
  const groupsObj =  useSelector((state) => state.groups.allGroups);
  let groups;
  if(groupsObj) groups = Object.values(groupsObj);
  let eventsObj = useSelector(state => state.events.allEvents);
  let events;
  if(eventsObj) events = Object.values(eventsObj);
  let comingEvents = [];
  if(events){
    comingEvents = events.filter((event) => new Date(event.startDate) < new Date());
  }

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);
  return((!groups || !events || !comingEvents) ? (<div><h1>Loading...</h1></div>) :
    <div>
    <div className='Headers'>
    <Link to='/events'>Events
    </Link>
    <Link to='/groups'>Groups</Link>
    </div>
    <div className='Title'>
    <h3>Groups In Meetup</h3>
    </div>
    <div className='GroupList'>
      {groups.map((group) => {
        return(
        <NavLink key={group.id} to={`/groups/${group.id}`}>
        <div className='Group'>
          <div className='ImageContainer'>
            <img src={group.previewImage}></img>
            </div>
            <div className='TextContainer'>
              <h1 className='GroupName'>{group.name}</h1>
              <h2 className='GroupLocation'>{group.city},{group.state}</h2>
              <h3 className='GroupDescription'>{group.about}</h3>
              </div>
              <div className='EventsType'>
              <h3 className='NumEvents'>{comingEvents.filter((event) => group.id == event.groupId).length} Events · {group.private}</h3>
              </div>
          </div>
          </NavLink>)
      })}
    </div>
    </div>
  )
}

export default GroupList;
