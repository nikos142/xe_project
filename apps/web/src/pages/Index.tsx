import * as routes from "../app/routes";
import NavChoice from "../components/NavChoice";

const Index = () => {
  return (
    <div
      className="row"
      style={{
        height: "100%",
      }}
    >
      <NavChoice
        text="Create new property ad"
        link={routes.NEW_PROPERTY}
        description={"Create and publish a new property advertisment."}
      />
      <NavChoice
        text="List of properties"
        link={routes.PROPERTIES_PAGE}
        description={
          "Searching for a new place? See the all the available properties!"
        }
      />
    </div>
  );
};

export default Index;
