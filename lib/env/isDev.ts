export const IS_DEV =
  process.env.NODE_ENV === "development" ||
  process.env.CTRL_DEV_SUITE === "true" ||
  process.env.CTRL_APP_MODE === "dev";
