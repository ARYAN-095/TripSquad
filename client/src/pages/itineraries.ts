import api from "../services/api";
import type { IItinerary, IItineraryItem } from "../types";

// Fetch one itinerary
export const fetchItinerary = async (id: string): Promise<IItinerary> => {
  const { data } = await api.get<IItinerary>(`/itineraries/${id}`);
  return data;
};

// Add an item
export const addItineraryItem = async (
  itineraryId: string,
  item: { title: string; date: string; locationName?: string }
): Promise<IItineraryItem[]> => {
  const { data } = await api.post<IItineraryItem[]>(
    `/itineraries/${itineraryId}/items`,
    item
  );
  return data;
};

// Toggle vote
export const voteItineraryItem = async (
  itineraryId: string,
  itemId: string
): Promise<IItineraryItem> => {
  const { data } = await api.post<IItineraryItem>(
    `/itineraries/${itineraryId}/items/${itemId}/vote`
  );
  return data;
};
