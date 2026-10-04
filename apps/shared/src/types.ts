type property_type="Rent"|"Buy"| "Exchange"| "Donate"

export interface Property {
  id: number;
  title: string;
  type: property_type;
  price:number;
  placeId: string;
  area:string;
  floor:number;
  bathrooms:number;
  extra_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyInput {
  title: string;
  type: string,
  price:number;
  placeId: string;
  area:string;
  floor:number;
  bathrooms:number;
  extra_description: string | null;
}

// export interface ErrorResponse {
//   error: string;
// }

export interface Area {
  placeId:string;
  mainText:string;
  secondaryText:string
}