import { move } from ".";
import { MoveInputs } from "../job";

const inputs: MoveInputs = {
  config: {
    endpoint: process.env["R2_ENDPOINT"] ?? "",
    accessKeyId: process.env["R2_ACCESS_KEY_ID"] ?? "",
    secretAccessKey: process.env["R2_SECRET_ACCESS_KEY"] ?? "",
    bucket: process.env["R2_BUCKET"] ?? "",
    bucketPathPrefix: "local-test",
  },
  sourceKey: "develop",
  targetKey: "main",
};
move(inputs).then(() => console.log("Done moving"));
