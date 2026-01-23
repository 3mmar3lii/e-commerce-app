import { Model, Document, PopulateOptions } from "mongoose";
import { Request, Response, NextFunction } from "express";
import AppError from "./AppError";
import catchAsync from "./catchAsync";
import { APIFeatures } from "../services/apiFeatures";

interface GetOneOptions {
  select?: string;
  populate?: PopulateOptions | (string | PopulateOptions)[];
  excludeFields?: string[];
}

export const getOne = <T extends Document>(
  Model: Model<T>,
  options: GetOneOptions = {},
) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);

    if (options.select) {
      query = query.select(options.select) as any;
    }

    if (options.populate) {
      query = query.populate(options.populate);
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with this ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

export const createOne = <T extends Document>(Model: Model<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });
};

export const updateOne = <T extends Document>(Model: Model<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with this ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

export const deleteOne = <T extends Document>(Model: Model<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with this ID", 404));
    }

    res.status(204).json(null);
  });
};

export const getAll = <T extends Document>(
  Model: Model<T>,
) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Build base query
    const query = Model.find();

    const features = new APIFeatures(query as any, req.query,Model as any)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    if (!docs || docs.length === 0) {
      return next(
        new AppError(`No documents found for ${Model.modelName}`, 404),
      );
    }

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: docs,
    });
  });
};