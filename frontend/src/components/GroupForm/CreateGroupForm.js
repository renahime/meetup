import GroupForm from "./GroupForm"

const createGroupForm = () => {
  const group = {
    location: '',
    city: '',
    state: '',
    name: '',
    about: '',
    type: '',
    private:'',
    previewImage:'',
    isPrivate:'',
  }

  return (
    <GroupForm group={group} formType="Create Group">
    </GroupForm>
  )
}

export default createGroupForm;
