import { Types } from "mongoose";

export interface IItineraryItem {
  _id: string;
  title: string;
  description?: string;
  date: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
  votes: string[]; // array of user IDs
  createdBy: { _id: string; name: string };
}

export interface ICollaborator {
  _id: string;
  user: { _id: string; name: string; email: string };
  role: "editor" | "viewer";
  status: "accepted" | "pending";
}

export interface IExpense {
  _id: string;
  description: string;
  amount: number;
  paidBy: { _id: string; name: string };
  splits: {
    user: { _id: string; name: string };
    share: number;
  }[];
  createdAt: string;
}

export interface IItinerary {
  _id: string;
  name: string;
  description?: string;
  owner: { _id: string; name: string };
  collaborators: ICollaborator[];
  items: IItineraryItem[];
  expenses: IExpense[];
  mapOverview?: {
    bounds: {
      ne: { lat: number; lng: number };
      sw: { lat: number; lng: number };
    };
    polylines?: string[];
  };
  createdAt: string;
  updatedAt: string;
}
