export const AuthSchemas = {
  RegisterEmail: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        example: "user@example.com",
      },
    },
  },
};