import * as routes from "../app/routes";
import NavLink from "../components/NavLink";
import PropertiesContent from "../features/PropertiesContent";

const Properties = () => {
  return (
    <div
      className="centeredColumn"
      style={{ gap: 15, paddingTop: "10px", paddingBottom: "10px" }}
    >
      <NavLink link={routes.NEW_PROPERTY} text={"Create new property ad"} />
      <PropertiesContent />
    </div>
  );
};

export default Properties;
