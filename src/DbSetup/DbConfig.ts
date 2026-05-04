import mongoose, { connect } from "mongoose";
import "dotenv/config";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const Db_Connection = process.env.DB_URL ?? "Not connected to DB";

const DbConnection = async () => {
  try {
    mongoose.set("strictQuery", false);
    await connect(Db_Connection, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    });
    console.log("DB Connected");

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected — reconnecting...');
      connect(Db_Connection);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err);
    });

  } catch (error) {
    console.log(error);
  }
};

export default DbConnection;