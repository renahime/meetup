import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../../store/group';
import './Groups.css'
const GroupList = () => {
  const groupsObj =  useSelector((state) => state.groups);
  const groups = Object.values(groupsObj);
  const dispatch = useDispatch();

  console.log(groups)
  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  console.log(groups)

  return(
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
        <Link path to={`/groups/${group.id}`}>
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
              <h3 className='NumEvents'>## Events</h3>
              </div>
          </div>
          </Link>)
      })}
    </div>
    </div>
  )
}

export default GroupList;
