import mongoose from "mongoose";

const dbConnection = async () => {
  mongoose.connect(process.env.MONGO_URI, {
    dbName: "PORTFOLIO",
  }).then(() =>{
    console.log("connected to database successfully");
  }).catch((error) => {
    console.error("Error connecting to the database:", error);
  })
}

export default dbConnection;