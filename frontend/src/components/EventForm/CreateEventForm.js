import EventForm from "./EventForm"

const createGroupForm = ({groupId}) => {
  const event = {
    name: '',
    description: '',
    type: '',
    capacity: '',
    price: '',
    startDate: '',
    endDate: '',
    previewImage:'',
  }

  return (
    <EventForm groupId={groupId} event={event} formType="Create Event">
    </EventForm>
  )
}

export default createGroupForm;
