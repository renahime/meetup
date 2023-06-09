import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchGroup } from "../../store/group";
import GroupForm from "./GroupForm";

const EditGroupForm = () => {
  const {groupId} = useParams();
  const group = useSelector((state) => state.groups.singleGroup ? state.groups.singleGroup : null);
  const dispatch = useDispatch();

  console.log(group);

  useEffect(() => {
    dispatch(fetchGroup(groupId));
  }, [dispatch, groupId]);

  if(!group) return(<></>)

  group.location = group.city + ',' + group.state;

  console.log(Object.keys(group).length)

  return (Object.keys(group).length > 1 && (
    <>
    <GroupForm
    group={group}
    formType="Update Group"
    ></GroupForm>
    </>
  ))
}

export default EditGroupForm
