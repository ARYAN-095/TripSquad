import api from "./api";
import type { IItinerary, IItineraryItem } from "../types";

export const fetchItineraries = async (): Promise<IItinerary[]> => {
  const { data } = await api.get<IItinerary[]>("/itineraries");
  return data;
};

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

export const addExpense = async (
    itineraryId: string,
    expense: {
      description: string;
      amount: number;
      splits: { user: string; share: number }[];
    }
  ): Promise<IExpense[]> => {
    const { data } = await api.post<IExpense[]>(
      `/itineraries/${itineraryId}/expenses`,
      expense
    );
    return data;
  };
  
  // Update an expense
  export const updateExpense = async (
    itineraryId: string,
    expenseId: string,
    updates: Partial<{ description: string; amount: number; splits: { user: string; share: number }[] }>
  ): Promise<IExpense> => {
    const { data } = await api.patch<IExpense>(
      `/itineraries/${itineraryId}/expenses/${expenseId}`,
      updates
    );
    return data;
  };
  
  // Delete an expense
  export const deleteExpense = async (
    itineraryId: string,
    expenseId: string
  ): Promise<void> => {
    await api.delete(`/itineraries/${itineraryId}/expenses/${expenseId}`);
  };