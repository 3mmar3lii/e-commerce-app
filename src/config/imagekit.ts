import ImageKit from "imagekit";
import AppError from "../utils/AppError";

if (
  !process.env.IMAGE_KIT_PUBLIC_KEY ||
  !process.env.IMAGE_KIT_PRIVATE_KEY ||
  !process.env.IMAGE_KIT_URL_ENDPOINT
) {
  throw new AppError(
    "Missing important env variables related to image kit",
    404,
  );
}
const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT!,
});

export default imagekit;
