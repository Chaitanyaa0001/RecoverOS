import app from "./app.js";
import { env } from "./config/env.config.js";
import connectDB from "./config/database.js";

await connectDB();

app.listen(env.PORT, () => {
  console.log(
    `RecoverJS server running on port ${env.PORT}`
  );
});