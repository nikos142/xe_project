import dayjs from "dayjs";
import Input from "./Input";
import TextArea from "./TextArea";
import "../styles/propertyStyles.css";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProperty, updatePropertyAd } from "../api/properties";
import { PropertySchema, type Property, type PropertyInput } from "@xe/shared";

const PROPERTY_TYPES = PropertySchema.shape.type.options;

const PropertyAd = ({ item }: PropertyAdProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const titleRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const floorRef = useRef<HTMLInputElement>(null);
  const bathroomsRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const refreshList = () =>
    queryClient.invalidateQueries({ queryKey: ["properties"] });

  const {
    mutate: saveProperty,
    isPending: isSaving,
    error: saveError,
    reset: clearSaveError,
  } = useMutation({
    mutationFn: (data: PropertyInput) => updatePropertyAd(item.id, data),
    onSuccess: () => {
      setIsEditing(false);
      refreshList();
    },
  });

  const { mutate: removeProperty, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteProperty(item.id),
    onSuccess: refreshList,
  });

  const handleSave = () => {
    saveProperty({
      title: titleRef.current?.value ?? item.title,
      type:
        (typeRef.current?.value as Property["type"] | undefined) ?? item.type,
      price: priceRef.current?.valueAsNumber ?? item.price,
      placeId: item.placeId,
      area: item.area,
      floor: floorRef.current?.valueAsNumber ?? item.floor,
      bathrooms: bathroomsRef.current?.valueAsNumber ?? item.bathrooms,
      extra_description: descriptionRef.current?.value ?? "",
    });
  };

  const handleCancel = () => {
    clearSaveError();
    setIsEditing(false);
  };

  return (
    <div className="propertyContainer">
      <div className="spacedRow" style={{ alignItems: "flex-start" }}>
        <div style={{ width: "75%" }}>
          {isEditing ? (
            <Input
              ref={titleRef}
              aria-label="Title"
              error={false}
              defaultValue={item.title}
            />
          ) : (
            <span className="propertyTitle">{item.title}</span>
          )}
        </div>
        {isEditing ? (
          <>
            <button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button onClick={handleCancel} disabled={isSaving}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button
              onClick={() => removeProperty()}
              disabled={isDeleting}
              aria-label="Delete property"
            >
              x
            </button>
          </>
        )}
      </div>
      {saveError && <span className="errorText">{saveError.message}</span>}
      <br />
      <div className="propertyDescription">
        {isEditing ? (
          <TextArea
            ref={descriptionRef}
            aria-label="Description"
            defaultValue={item.extra_description ?? ""}
          />
        ) : (
          <span>{item.extra_description}</span>
        )}
      </div>
      <br />
      <div className="propertyDetails">
        <span className="propertyLabel">Floor:</span>
        {isEditing ? (
          <Input
            ref={floorRef}
            aria-label="Floor"
            error={false}
            type="number"
            inputMode="numeric"
            min={0}
            max={6}
            defaultValue={item.floor}
          />
        ) : (
          <b>{item.floor}</b>
        )}

        <span className="propertyLabel">Type:</span>
        {isEditing ? (
          <select
            ref={typeRef}
            aria-label="Type"
            className="input"
            defaultValue={item.type}
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        ) : (
          <b>{item.type}</b>
        )}

        <span className="propertyLabel">Bathrooms:</span>
        {isEditing ? (
          <Input
            ref={bathroomsRef}
            aria-label="Bathrooms"
            error={false}
            type="number"
            inputMode="numeric"
            min={1}
            defaultValue={item.bathrooms}
          />
        ) : (
          <b>{item.bathrooms}</b>
        )}

        <span className="propertyLabel">Price:</span>
        {isEditing ? (
          <Input
            ref={priceRef}
            aria-label="Price"
            error={false}
            type="number"
            inputMode="numeric"
            step={0.01}
            min={0}
            defaultValue={item.price}
          />
        ) : (
          <b>{item.price}€</b>
        )}
      </div>
      <div className="spacedRow">
        <span>{item.area}</span>
        <span>{dayjs(item.created_at).format("DD MMM YYYY")}</span>
      </div>
    </div>
  );
};

export default PropertyAd;

interface PropertyAdProps {
  item: Property;
}
