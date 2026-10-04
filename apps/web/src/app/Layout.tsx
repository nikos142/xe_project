import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div style={{ height: "100vh" }}>
      <Outlet />
    </div>
  );
};

export default Layout;
