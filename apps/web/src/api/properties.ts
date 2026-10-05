import { request } from "./request";
import type { PropertyInput ,Property} from "@xe/shared";

export const postPropertyAd = (data: PropertyInput) =>
  request<Property>("/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  export const updatePropertyAd = (id:number, data: PropertyInput) =>
  request<Property>(`/api/properties/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const getProperties = ({ signal }: { signal: AbortSignal }) =>
  request<Property[]>("/api/properties", { signal });

export const deleteProperty = (id: number) =>
  request<null>(`/api/properties/${id}`, { method: "DELETE" });