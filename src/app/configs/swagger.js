const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js API Documentation",
      version: "1.0.0",
      description: "API documentation with Swagger",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}/api/v1`,
      },
    ],
  },
  apis: ["./src/app/routers/*.js"], // Đường dẫn đến các tệp chứa chú thích Swagger
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
