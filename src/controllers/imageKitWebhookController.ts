import catchAsync from "../utils/catchAsync";


export const imageKitWebhook = catchAsync(async (req, res, next) => {
  console.log("Webhook imageKit fired here =>", req.body);
  res.json({
    msg: "Webhook recived",
    data: req.body,
  })
})