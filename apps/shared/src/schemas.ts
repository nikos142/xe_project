import { object, string, number, enum as zEnum } from "zod";



export const PropertySchema = object({
  title: string().trim().max(155, "Title must be up to 155 characters").nonempty("Title is required!"),
  price: number().nonnegative("Price can't be negative number!"),
  placeId: string().nonempty("No area selected!"),
  area: string().nonempty(),
  type: zEnum(["Rent", "Buy", "Exchange", "Donation"], {
    error: "Type is required!",
  }),
  extra_description: string("Description must be a text."),
  floor:number('Floor number is required.').int("Floor must be an integer number.").nonnegative("Floor can't be negative number!").max(6, "Floor must be a number between 0 and 6."),
  bathrooms:number('Bathrooms number is required.').int("Bathrooms must be an integer number.").min(1, 'Bathrooms must be greater or equal to 1.'),
});
