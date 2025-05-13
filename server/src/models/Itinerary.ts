import mongoose, { Document, Schema, Types } from "mongoose";
import { IUser } from "./User";

export interface Expense extends Document {
  description: string;
  amount: number;
  paidBy: Types.ObjectId; // who paid
  splits: {
    user: Types.ObjectId;
    share: number; // e.g. 25.50
  }[];
  createdAt: Date;
}

export interface ItineraryItem extends Document {
  title: string;
  description?: string;
  date: Date;
  locationName?: string;
  coords?: { lat: number; lng: number };
  createdBy: Types.ObjectId;
  votes: Types.ObjectId[];
}

export interface Collaborator extends Document {
  user: Types.ObjectId;
  role: "editor" | "viewer";
  status: "accepted" | "pending";
}

export interface IItinerary extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId;
  // invitations track invited users who haven't accepted yet
  collaborators: Types.DocumentArray<Collaborator>;
  items: Types.DocumentArray<ItineraryItem>;
  expenses: Types.DocumentArray<Expense>;
  // optional: store a map viewport or polyline for PDF export
  mapOverview?: {
    bounds: {
      ne: { lat: number; lng: number };
      sw: { lat: number; lng: number };
    };
    polylines?: string[]; // encoded Google Maps polylines
  };
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<Expense>(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    splits: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        share: { type: Number, required: true },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ItineraryItemSchema = new Schema<ItineraryItem>(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    locationName: { type: String },
    coords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    votes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: true }
);

const CollaboratorSchema = new Schema<Collaborator>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["editor", "viewer"], default: "editor" },
    status: { type: String, enum: ["accepted", "pending"], default: "pending" },
  },
  { _id: true }
);

const ItinerarySchema = new Schema<IItinerary>(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [CollaboratorSchema],
    items: [ItineraryItemSchema],
    expenses: [ExpenseSchema],
    mapOverview: {
      bounds: {
        ne: { lat: Number, lng: Number },
        sw: { lat: Number, lng: Number },
      },
      polylines: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IItinerary>("Itinerary", ItinerarySchema);
