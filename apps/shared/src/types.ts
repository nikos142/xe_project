import {  type infer as Infer } from "zod";
import type { PropertySchema } from "./schemas";

type propertyType="Rent"|"Buy"| "Exchange"| "Donation"

export interface Property {
  id: number;
  title: string;
  type: propertyType;
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
  type: propertyType;
  price:number;
  placeId: string;
  area:string;
  floor:number;
  bathrooms:number;
  extra_description: string | null;
}

export interface Area {
  placeId:string;
  mainText:string;
  secondaryText:string
}

export type FieldErrors = Partial<Record<keyof PropertyForm, string[]>>;
export type PropertyForm = Infer<typeof PropertySchema>;