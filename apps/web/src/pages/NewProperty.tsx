import { type Area } from "@xe/shared";
import Input from "../components/Input";
import * as routes from "../app/routes";
import { useRef, useState } from "react";
import { PropertySchema } from "@xe/shared";
import NavLink from "../components/NavLink";
import SelectBox from "../features/SelectBox";
import TextArea from "../components/TextArea";
import FadeBanner from "../components/FadeBanner";
import { postPropertyAd } from "../api/properties";
import { useMutation } from "@tanstack/react-query";
import { flattenError, type infer as Infer } from "zod";
import InputContainer from "../components/InputContainer";
import AutocompleteInput from "../features/AutocompleteInput";

type FieldErrors = Partial<Record<keyof PropertyForm, string[]>>;
type PropertyForm = Infer<typeof PropertySchema>;

const NewProperty = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const floorRef = useRef<HTMLInputElement>(null);
  const bathRoomRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<{
    message: string;
    state: "success" | "fail";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("Rent");
  const [area, setArea] = useState("");
  const [placeId, setPlaceId] = useState("");

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = titleRef.current?.value;
    const price = priceRef.current?.valueAsNumber;
    const floor = floorRef.current?.valueAsNumber;
    const bathrooms = bathRoomRef.current?.valueAsNumber;
    const extra_description = descriptionRef.current?.value;

    const input = {
      title,
      type,
      price,
      placeId,
      area,
      floor,
      bathrooms,
      extra_description,
    };

    const { success, data, error } = PropertySchema.safeParse(input);

    if (success) {
      mutate(data);
    } else {
      setFormErrors(flattenError(error).fieldErrors);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setType(e.target.value);

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Typing after a selection invalidates the chosen area
    setPlaceId("");
    setArea("");
  };

  const handleAreaSelect = (area: Area) => {
    setSearchTerm(area.mainText);
    setPlaceId(area.placeId);
    setArea(area.mainText + ", " + area.secondaryText);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: postPropertyAd,
    onSuccess: () => {
      setBanner({ message: "Property advertisement saved!", state: "success" });
      resetForm();
    },
    onError: () =>
      setBanner({ message: "System error! Please try again.", state: "fail" }),
  });

  const resetForm = () => {
    formRef.current?.reset(); // clears title, price, description, floor, bathrooms
    setType("Rent");
    setSearchTerm("");
    setPlaceId("");
    setArea("");
    setFormErrors({});
  };

  return (
    <div className="centeredColumn">
      <div style={{ textAlign: "center" }}>
        <h1>Create a new property advertisment</h1>
        <NavLink link={routes.PROPERTIES_PAGE} text="See all properties" />
      </div>
      <div className="formContainer">
        <form onSubmit={handleSubmit} ref={formRef}>
          <InputContainer type="title" label="Title*">
            <Input
              id="title"
              type="text"
              required
              ref={titleRef}
              error={!!formErrors.title}
              errorText={formErrors.title?.[0]}
            />
          </InputContainer>
          <SelectBox
            onChange={handleTypeChange}
            type={type}
            error={!!formErrors.type}
            errorText={formErrors.type?.[0]}
          />
          <AutocompleteInput
            onChange={handleSearchTermChange}
            onSelect={handleAreaSelect}
            searchTerm={searchTerm}
            error={!!formErrors.placeId}
            errorText={formErrors.placeId?.[0]}
          />
          <div className="row" style={{ gap: 10 }}>
            <InputContainer type="floor" label="Floor*">
              <Input
                id="floor"
                required
                type="number"
                inputMode="numeric"
                ref={floorRef}
                error={!!formErrors.floor}
                errorText={formErrors.floor?.[0]}
                min={0}
              />
            </InputContainer>
            <InputContainer type="bathrooms" label="Bathrooms*">
              <Input
                id="bathrooms"
                required
                type="number"
                inputMode="numeric"
                ref={bathRoomRef}
                error={!!formErrors.bathrooms}
                errorText={formErrors.bathrooms?.[0]}
                min={1}
              />
            </InputContainer>
          </div>
          <InputContainer type="price" label="Price*">
            <Input
              id="price"
              required
              type="number"
              inputMode="numeric"
              step={0.01}
              ref={priceRef}
              error={!!formErrors.price}
              errorText={formErrors.price?.[0]}
            />
          </InputContainer>
          <InputContainer type="desc" label="Description">
            <TextArea id="desc" ref={descriptionRef} />
          </InputContainer>
          <div className="row" style={{ gap: 10 }}>
            <button className="formButton" type="reset" onClick={resetForm}>
              Reset
            </button>
            <button disabled={isPending} className="formButton" type="submit">
              Save Ad
            </button>
          </div>
        </form>
      </div>
      {banner && (
        <FadeBanner
          message={banner.message}
          state={banner.state}
          onClose={() => setBanner(null)}
        />
      )}
    </div>
  );
};

export default NewProperty;
