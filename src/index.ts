import "dotenv/config";
import { app } from "./app";
import DbConnection from "./DbSetup/DbConfig";
import appAgenda from "./Model/AppAgenda/AppAgenda";

const startServer = async () => {
  await DbConnection();
  appAgenda();

  app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT || 8080}`);
  });
};

startServer();