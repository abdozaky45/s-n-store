import { AuthSchemas } from "../schemas/auth.schema";
export const authPaths = {
  "/authentication/register-email": {
    post: {
      tags: ["Admin - Authentication"],
      summary: "Register user with email",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: AuthSchemas.RegisterEmail,
          },
        },
      },
      responses: {
        200: {
          description: "Email sent successfully",
        },
      },
    },
  },
};