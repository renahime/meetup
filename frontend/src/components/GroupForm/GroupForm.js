import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateGroup, createGroup } from '../../store/group';
import './GroupForm.css'

const GroupForm = ({group, formType}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [location,setLocation] = useState(group?.location)
  const [name, setName] = useState(group?.name)
  const [about, setAbout] = useState(group?.about)
  const [type, setType] = useState(group?.type);
  const [isPrivate, setPrivate] = useState(group?.private);
  const [previewImage, setPreviewImage] = useState(group?.previewImage)
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    group = {...group, location, name, about, type, previewImage, isPrivate};

    if (group.location.includes(',')){
      group.city = location.split(',')[0]
      group.state = location.split(',')[1]
    }
    delete group.location;

    group.private = group.isPrivate;

    if(formType == "Create Group"){
      const newGroup = await dispatch(createGroup(group)).catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        };
    });
      group = newGroup;
    } else if (formType == 'Update Group'){
      const editedGroup = await dispatch(updateGroup(group)).catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        };
    });
      group = editedGroup
    }

    if(group){
      history.push(`/groups/${group.id}`);
    }
  };


  useEffect(() => {
    if(!group.location.includes(',')){
      setErrors({location:'Please include a , to separate city and state'})
    }
  },[location])

  return (
    <div className='Body'>
    <div className='Title'>
    <h4>Become an Organizer</h4>
    <h3>We'll Walk you through a few steps to build your local Community</h3>
    </div>
    <form onSubmit={handleSubmit}>
    <div className='Location'>
      <h2>First, set your group's location</h2>
      <h3>Meetup groups meet locally, in person and online. We'll connect you with people
      in your area, and more can join you online</h3>
      <input className='InputText' type="text" value={location} onChange={(e) => setLocation(e.target.value)}>
      </input>
      <div>
      <p className='errors'>{errors.location}</p>
      </div>
    </div>
    <div className='Name'>
      <h2>What will your group's name be?</h2>
      <h3>Choose a name that will give people a clear idea of what the group is about.
      Feel free to get creative! You can edit this later if you change your mind.
      </h3>
      <input className='InputText' type='text' value={name} onChange={(e) => setName(e.target.value)}>
      </input>
    </div>
    <div>
    <p className='errors'>{errors.name}</p>
      </div>
    <div className='About'>
      <h2>Now describe what your group will be about</h2>
      <h5>People will see this when we promote your group, but you'll be able to add to it later, too.</h5>
      <h5>1, What's the purpose of the group?</h5>
      <h5> 2. Who should join?</h5>
      <h5>3. What will you do at your events??</h5>
      <textarea className='InputAbout' value={about} onChange={(e) => setAbout(e.target.value)}>
      </textarea>
    </div>
    <div>
    <p className='errors'>{errors.about}</p>
      </div>
    <div className='Ect'>
      <h2>Final steps...</h2>
      <h4>Is this an in person or online group?</h4>
      <select value={type} className='Type' onChange={(e) => setType(e.target.value)}>
        <option value='Select One'> Select One</option>
        <option value='In person'>In person</option>
        <option value='Online'>Online</option>
      </select>
      <div>
      <p className='errors'>{errors.type}</p>
      </div>
      <h4>Is this group private or public?</h4>
      <select value={isPrivate} className='Private' onChange={(e) => setPrivate(e.target.value)}>
      <option value='Select One'> Select One</option>
        <option value='Private'>Private</option>
        <option value='Public'>Public</option>
      </select>
      <div>
      <p className='errors'>{errors.private}</p>
      </div>
    </div>
    {formType == 'Create Group' ? (    <div className='Image'>
      <h4>Please add in image url for your group below:</h4>
      <input className='InputText' type='text' value={previewImage} onChange={(e) => setPreviewImage(e.target.value)}></input>
      <p className='errors'>{errors.previewImage}</p>
    </div>
) : <></>}
    {(formType == 'Create Group') ? (<button type="submit" >Create Group</button>) :  (<button type="submit" >Update Group</button>) }
    </form>
    </div>
  )
}

export default GroupForm;

// e.target.value == 'Private' ? setPrivate(true) : setPrivate(false)
