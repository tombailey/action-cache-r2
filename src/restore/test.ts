import { restore } from ".";
import { RestoreInputs } from "../job";

const inputs: RestoreInputs = {
  restoreKeys: ["patch/my-branch", "develop", "main"],
  config: {
    endpoint: process.env["R2_ENDPOINT"] ?? "",
    accessKeyId: process.env["R2_ACCESS_KEY_ID"] ?? "",
    secretAccessKey: process.env["R2_SECRET_ACCESS_KEY"] ?? "",
    bucket: process.env["R2_BUCKET"] ?? "",
    bucketPathPrefix: "local-test",
  },
};
restore(inputs).then(() => console.log("Done restoring"));
