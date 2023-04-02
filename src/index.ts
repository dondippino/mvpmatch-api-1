import { App } from "./app";

const PORT = process.env.PORT || 5090;
App.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
