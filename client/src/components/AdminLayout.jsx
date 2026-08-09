import StaffLayout from "./StaffLayout";
const navigation=[{to:"/admin/dashboard",label:"Dashboard",icon:"home"},{to:"/admin/complaints",label:"Complaints",icon:"clipboard"},{to:"/admin/users",label:"Users",icon:"user"}];
function AdminLayout(){return <StaffLayout title="Administrator portal" subtitle="City administration" navigation={navigation}/>}
export default AdminLayout;
