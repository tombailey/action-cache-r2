import { save } from ".";
import { SaveInputs } from "../job";

const inputs: SaveInputs = {
  saveKey: "develop",
  config: {
    endpoint: process.env["R2_ENDPOINT"] ?? "",
    accessKeyId: process.env["R2_ACCESS_KEY_ID"] ?? "",
    secretAccessKey: process.env["R2_SECRET_ACCESS_KEY"] ?? "",
    bucket: process.env["R2_BUCKET"] ?? "",
    bucketPathPrefix: "local-test",
  },
  paths: [
    "~/test_file.txt",
    "~/test_dir",
    "/app/test_file.txt",
    "/app/test_dir",
  ],
};
save(inputs).then(() => console.log("Done saving"));
