const app = require("./app");

const PORT = 8080;
const HOST = process.env.DB_HOST || "0.0.0.0";
const dotenv = require("dotenv");
dotenv.config();

app.set("port", process.env.DB_PORT);
app.set("host", process.env.DB_HOST);

// app.listen(PORT, HOST, () => {
//   console.log(`Server is running on: ${HOST}:${PORT}`);
// });
app.listen(PORT, () => {
  console.log(`${PORT}번에서 실행되었습니다.`);
});
