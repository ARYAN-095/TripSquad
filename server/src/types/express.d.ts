import { IUser } from "../models/User";
import { Request } from "express";

declare module "express" {
  export interface Request {
    user?: IUser;
  }
}
