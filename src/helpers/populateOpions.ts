import { PopulateOption } from "../utils/handlerFactory";



export default function populateOptions(
  options: PopulateOption[], 
  query: any,
) {
  if (!Array.isArray(options) || options.length === 0) {
    return query;
  }

  let newQuery = query;

  for (const opt of options) {
    if (opt.populate) {
      // Handle nested populate
      newQuery = newQuery.populate({
        path: opt.path,
        select: opt.select,
        populate: opt.populate, 
      });
    } else {
      console.log("no have populate");
      console.log(opt.path)
      console.log(opt.select)
      newQuery = newQuery.populate({
        path: opt.path,
        select: opt.select,
      });
    }
  }
console.log("final query",newQuery)
  return newQuery;
}
