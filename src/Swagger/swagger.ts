import { authPaths } from "./paths/auth.path";

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "S&N API",
    version: "1.0.0",
    description: "E-commerce API Documentation",
  },
  paths: {
    ...authPaths,
  },
};