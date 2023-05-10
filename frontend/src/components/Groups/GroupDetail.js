import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroup } from '../../store/group';
import DeleteModal from './GroupDeleteModal';
import './Groups.css';

const GroupDetail = () => {
  const {groupId} = useParams();
  let group = useSelector(state => state.groups[groupId]);
  const sessionUser = useSelector(state => state.session.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [groupOwner, setGroupOwner] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchGroup(groupId));
    setTimeout(() => {
      setLoading(false);
    }, 500)

    if(sessionUser){
      if(group.organizerId === sessionUser.id){
        setGroupOwner(true);
      } else setGroupOwner(false)}
  },[dispatch,groupId,sessionUser,groupOwner]);


  return loading ? (<div><h1>Loading...</h1></div>) : (
  <div>
    <div className='Return'>
      <h4>Groups</h4>
    </div>
    <div className='GroupContainer'>
      <div className='GroupImage'>
      </div>
      <div className='GroupText'>
        <h1>{group.name}</h1>
        <h2>{group.city},{group.state}</h2>
        <h2>## Events Public</h2>
        <h2>Organized By {group.Organizer.firstName} {group.Organizer.lastName}</h2>
      </div>
      <div className='Buttons'>
        {groupOwner ? (
          <>
          <div className='owner-buttons'>
          <button>Create Event</button>
          <button>Update</button>
          <div className='Delete'>
          <button onClick={() => setIsOpen(true)} >Delete</button>
          <DeleteModal group={group} history={history} dispatch={dispatch} open={isOpen} onClose={() => setIsOpen(false)}>
          </DeleteModal>
          </div>
          </div>
          </>
          ) : (
            <>
            <div className='user-buttons'>
              <button>Join this Group</button>
              </div>
              </>
          )
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
      <div className='Events'>
        <h2>Past Events</h2>
        <div className='PastEvents'></div>
      </div>
    </div>
)
}

export default GroupDetail
