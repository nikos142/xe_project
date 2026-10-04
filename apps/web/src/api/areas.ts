import type { Area } from "@xe/shared";
import { request } from "./request";

export const fetchAreas = ({searchTerm, signal }: {searchTerm:string, signal: AbortSignal }) =>
  request<{places: Area[]}>("/api/areas/"+ encodeURIComponent(searchTerm), { signal });