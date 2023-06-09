import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent } from '../../store/event';
import { fetchGroup } from '../../store/group';
import './EventForm.css'


const EventForm = ({ event, formType }) => {
  const { groupId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const [name, setName] = useState(event?.name);
  const [description, setDescription] = useState(event?.description);
  const [type, setType] = useState(event?.type);
  const [capacity, setCapacity] = useState(event?.capacity);
  const [price, setPrice] = useState(event?.price);
  const [startDate, setStartDate] = useState(event?.startDate);
  const [endDate, setEndDate] = useState(event?.endDate);
  const [previewImage, setPreviewImage] = useState(event?.previewImage);
  const [errors, setErrors] = useState({});
  const sessionUser = useSelector(state => state.session.user)



  let group = useSelector(state => state.groups.singleGroup);

  useEffect(() => {
    dispatch(fetchGroup(groupId));
    if (group) {
      if (sessionUser.id !== group.organizerId) {
        history.push('/')
      }
    }
  }, [dispatch, groupId, sessionUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    event = { ...event, name, description, type, capacity, price, startDate, endDate, previewImage };
    event.capacity = Number(event.capacity);
    event.price = Number(event.price);



    const newEvent = await dispatch(createEvent(event, groupId)).catch(async (res) => {
      const data = await res.json();
      if (data && data.errors) {
        setErrors(data.errors);
      };
    });
    event = newEvent;

    if (event.errors) {
      setErrors(event.errors)
    } else if (event) {
      history.push(`/events/${event.id}`)
    }
  }

  return (!group ? (<div><h1>Loading...</h1></div>) :
    <div className='Body'>
      <div style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} className='Title'>
        <h2>Create an Event for {`${group.name}`}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className='Name' style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} >
          <h4>What is the name of your event?</h4>
          <input className='InputText' placeholder="Event Name" type='text' value={name} onChange={(e) => setName(e.target.value)}>
          </input>
        </div>
        <div>
          <p className='errors'>{errors.name}</p>
        </div>
        <div className='Type' style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} >
          <h4>Is this an in person or online group?</h4>
          <select value={type} className='Type' onChange={(e) => setType(e.target.value)}>
            <option value='Select One'> Select One</option>
            <option value='In person'>In person</option>
            <option value='Online'>Online</option>
          </select>
        </div>
        <div>
          <p className='errors'>{errors.type}</p>
        </div>
        <div className='Capacity' style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} >
          <h4>How many people can attend this event?</h4>
          <input value={capacity} type="number" placeholder="1" min="1" onChange={(e) => setCapacity(e.target.value)}></input>
        </div>
        <div>
          <p className='errors'>{errors.capacity}</p>
        </div>
        <div className='Price' style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} >
          <h4>What is the price of your event?</h4>
          <input value={price} type="number" placeholder="0" min="0" onChange={(e) => setPrice(e.target.value)}></input>
        </div>
        <div>
          <p className='errors'>{errors.price}</p>
        </div>
        <div className='Date' style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} >
          <h4>When does your event start?</h4>
          <input value={startDate} type="datetime-local" min={Date()} onChange={(e) => setStartDate(e.target.value)}></input>
          <div>
            <p className='errors'>{errors.startDate}</p>
          </div>
          <h4>When does your event end?</h4>
          <input value={endDate} type="datetime-local" min={startDate} onChange={(e) => setEndDate(e.target.value)}></input>
          <div>
            <p className='errors'>{errors.endDate}</p>
          </div>
        </div>
        <div style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }}>
          <div className='Image'  >
            <h4>Please Add an Image to your Event Below</h4>
            <input className='InputText' placeholder="Image URL" type='text' value={previewImage} onChange={(e) => setPreviewImage(e.target.value)}></input>
          </div>
          <div>
            <p className='errors'>{errors.previewImage}</p>
          </div>
        </div>
        <div className='Description' style={{ borderBottom: 'solid black', paddingTop: '10px', paddingBottom: '10px' }} >
          <h4>Please Describe Your Event</h4>
          <textarea placeholder="Please include at least 30 characters" className='InputDescription' value={description} onChange={(e) => setDescription(e.target.value)}>
          </textarea>
          <div>
            <p className='errors'>{errors.description}</p>
          </div>
        </div>
        <div className='buttonContainer'>
          <button className='submitButton' type="submit" >Create Event</button>
        </div>
      </form>
    </div>
  )
}

export default EventForm
