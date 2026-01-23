import { Document, QueryFilter } from "mongoose";

type QueryParams = {
  sort?: string;
  fields?: string;
  page?: string | number;
  limit?: string | number;
  search?: string;
  [key: string]: unknown;
};

export class APIFeatures<T> {
  public query: any;
  private queryString: QueryParams;
  private model: any;

  constructor(
    query: QueryFilter<T>,
    queryString: QueryParams,
    model: Document,
  ) {
    this.query = query;
    this.queryString = queryString;
    this.model = model;
  }
  filter(): this {
    const queryObj = { ...this.queryString };
    ["page", "sort", "limit", "fields", "search"].forEach(
      (el) => delete queryObj[el],
    );

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort(): this {
    const allowedFields = Object.keys(this.model.schema.paths).filter(
      (field) => !["__v", "password", "passwordChangedAt"].includes(field),
    );
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(",")
        .map((field) => {
          const clean = field.startsWith("-") ? field.slice(1) : field;
          if (!allowedFields.includes(clean)) return null;
          return field;
        })
        .filter(Boolean)
        .join(" ");
      if (sortBy) this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate(): this {
    const page = Number(this.queryString.page) || 1;
    const limit = Math.min(Number(this.queryString.limit) || 20, 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  search(): this {
    const searchableFields = Object.keys(this.model.schema.paths)
      .filter((field) =>
        ["String"].includes(this.model.schema.paths[field].instance),
      )
      .filter((field) => !["password", "__v"].includes(field));

    if (this.queryString.search && searchableFields.length) {
      const escaped = this.queryString.search.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        "\\$&",
      );
      const conditions = searchableFields.map((f) => ({
        [f]: { $regex: escaped, $options: "i" },
      }));
      this.query = this.query.find({ $or: conditions });
    }
    return this;
  }
}
