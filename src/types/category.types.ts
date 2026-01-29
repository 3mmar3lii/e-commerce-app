import { Types } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  parentId?: Types.ObjectId | null; // root category has null
  level?: number; // 0 = root, 1 = sub, 2 = sub-sub
  isLeaf?: boolean; // true if products can be placed here
  isActive?: boolean; // true if visible
  createdAt?: Date;
  updatedAt?: Date;
}
