import StaffLayout from "./StaffLayout";
const navigation=[{to:"/officer/dashboard",label:"Dashboard",icon:"home"},{to:"/officer/complaints",label:"Assignments",icon:"clipboard"}];
function OfficerLayout(){return <StaffLayout title="Ward officer portal" subtitle="Field operations" navigation={navigation}/>}
export default OfficerLayout;
