import "dotenv/config";
import { app } from "./app";
import DbConnection from "./DbSetup/DbConfig";
import startAgendas from "./Utils/Agenda/StartAgenda";
const startServer = async ()=>{
await DbConnection();
//startAgendas();
}
app.listen(process.env.PORT, async () => {
  console.log(`server is running on port ${process.env.PORT || 8080}`);
});
startServer();
