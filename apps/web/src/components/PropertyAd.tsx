import dayjs from "dayjs";
import "../styles/propertyStyles.css";
import type { Property } from "@xe/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProperty } from "../api/properties";

const PropertyAd = ({ item }: PropertyAdProps) => {
  const queryClient = useQueryClient();

  const { mutate: removeProperty, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteProperty(item.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["properties"] }),
  });

  return (
    <div className="propertyContainer">
      <div className="spacedRow" style={{ alignItems: "flex-start" }}>
        <span className="propertyTitle">{item.title}</span>
        <button onClick={() => removeProperty()} disabled={isDeleting}>
          x
        </button>
      </div>
      <br />
      <div className="propertyDescription">
        <span>{item.extra_description}</span>
      </div>
      <br />
      <div className="spacedRow" style={{ marginBottom: 10 }}>
        <div className="column" style={{ gap: 5 }}>
          <span>
            Floor:&nbsp;
            <b>{item.floor}</b>
          </span>
          <span>
            Bathrooms:&nbsp;
            <b>{item.bathrooms}</b>
          </span>
        </div>
        <div className="column" style={{ gap: 5 }}>
          <span>
            Type:&nbsp;
            <b>{item.type}</b>
          </span>
          <span>
            Price:&nbsp;
            <b>{item.price}€</b>
          </span>
        </div>
      </div>
      <div className="spacedRow">
        <span key={item.id}>{item.area}</span>
        <span>{dayjs(item.created_at).format("DD MMM YYYY")}</span>
      </div>
    </div>
  );
};

export default PropertyAd;

interface PropertyAdProps {
  item: Property;
}
