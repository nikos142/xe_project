import Error from "../components/Error";
import Loader from "../components/Loader";
import { useQuery } from "@tanstack/react-query";
import { getProperties } from "../api/properties";
import PropertyAd from "../components/PropertyAd";
import type { Property } from "@xe/shared";

const PropertiesContent = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["properties"],
    queryFn: ({ signal }) => getProperties({ signal }),
    staleTime: 5000,
  });

  if (isPending) return <Loader height={"90vh"} />;

  if (isError)
    return (
      <Error
        height="90vh"
        message="System Error! Could not fetch properties."
      />
    );

  if (data.length === 0) return <p>No property advertisements found!</p>;

  return data.map((item: Property) => <PropertyAd key={item.id} item={item} />);
};

export default PropertiesContent;
