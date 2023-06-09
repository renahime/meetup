import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateGroup, createGroup } from '../../store/group';
import './GroupForm.css'

const GroupForm = ({ group, formType }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [location, setLocation] = useState(group?.location)
  const [name, setName] = useState(group?.name)
  const [about, setAbout] = useState(group?.about)
  const [type, setType] = useState(group?.type);
  const [isPrivate, setPrivate] = useState(group?.private);
  const [previewImage, setPreviewImage] = useState(group?.previewImage)
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    group = { ...group, location, name, about, type, previewImage, isPrivate };

    if (group.location.includes(',')) {
      group.city = location.split(',')[0]
      group.state = location.split(',')[1]
    }
    delete group.location;

    group.private = group.isPrivate;

    if (formType == "Create Group") {
      const newGroup = dispatch(createGroup(group))
        .then(newGroup => { history.push(`/groups/${newGroup.id}`) })
        .catch(async (res) => {
          const data = await res.json();
          setErrors(data.errors);
        });
    } else if (formType == 'Update Group') {
      const editedGroup = dispatch(updateGroup(group)).then(editedGroup => { history.push(`/groups/${editedGroup.id}`) }).catch(async (res) => {
        const data = await res.json();
        setErrors(data.errors);
      });
      group = editedGroup
    }
  };

  return (
    <div className='Body'>
      {formType == "Create Group" ? (<div style={{ borderBottom: 'solid black' }} className='Title'>
        <h4>Become an Organizer</h4>
        <h3 >We'll Walk you through a few steps to build your local Community</h3>
      </div>
      ) : <div style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} className='updateTitle'>
        <h4 style={{ color: '#b67295' }}>UPDATE YOUR GROUP'S INFORMATION</h4>
        <h3>We'll Walk you through a few steps to build your local Community</h3>
      </div>}
      <form onSubmit={handleSubmit}>
        <div style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} className='Location'>
          <h2>First, set your group's location</h2>
          <h3>Meetup groups meet locally, in person and online. We'll connect you with people
            in your area, and more can join you online</h3>
          <input className='InputText' type="text" placeholder="City, State" value={location} onChange={(e) => setLocation(e.target.value)}>
          </input>
          <div>
            <p className='errors'>{errors.location}</p>
            <p className='errors'>{errors.city}</p>
            <p className='errors'>{errors.state}</p>
          </div>
        </div>
        <div style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} className='Name'>
          <h2>What will your group's name be?</h2>
          <h3>Choose a name that will give people a clear idea of what the group is about.
            Feel free to get creative! You can edit this later if you change your mind.
          </h3>
          <input className='InputText' type='text' placeholder="What is your group name?" value={name} onChange={(e) => setName(e.target.value)}>
          </input>
        </div>
        <div>
          <p className='errors'>{errors.name}</p>
        </div>
        <div style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} className='About'>
          <h2>Now describe what your group will be about</h2>
          <h5>People will see this when we promote your group, but you'll be able to add to it later, too.</h5>
          <h5>1, What's the purpose of the group?</h5>
          <h5> 2. Who should join?</h5>
          <h5>3. What will you do at your events??</h5>
          <textarea className='InputAbout' placeholder="Please write at least 30 characters" value={about} onChange={(e) => setAbout(e.target.value)}>
          </textarea>
        </div>
        <div>
          <p className='errors'>{errors.about}</p>
        </div>
        <div style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} className='Ect'>
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
        {formType == 'Create Group' ? (<div className='Image'>
          <h4>Please add in image url for your group below:</h4>
          <input placeholder="Image Url" className='InputText' type='text' value={previewImage} onChange={(e) => setPreviewImage(e.target.value)}></input>
          <p className='errors'>{errors.previewImage}</p>
        </div>
        ) : <></>}
        {(formType == 'Create Group') ? (<div className='buttonContainer'>
          <button className='submitButton' type="submit" >Create Group</button> </div>) : (<div className='buttonContainer'>
            <button className='submitButton' type="submit" >Update Group</button></div>)}
      </form>
    </div>
  )
}

export default GroupForm;

// e.target.value == 'Private' ? setPrivate(true) : setPrivate(false)
