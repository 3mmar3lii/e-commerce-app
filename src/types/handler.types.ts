import { Document, Model } from "mongoose";

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  keyword?: string; 
}

export type PopulateOption = {
  path: string;
  select?: string;
};

export interface HandlerFactoryOptions<T extends Document> {
  model: Model<T>;
  populateOptions?: PopulateOption | PopulateOption[];
  excludeFields?: string[]; 
}
