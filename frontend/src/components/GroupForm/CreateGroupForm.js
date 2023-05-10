import GroupForm from "./GroupForm"

const createGroupForm = () => {
  const group = {
    city: '',
    state: '',
    name: '',
    about: '',
    type: '',
    private: '',
    previewImage:''
  }

  return (
    <GroupForm group={group} formType="Create Group">
    </GroupForm>
  )
}
