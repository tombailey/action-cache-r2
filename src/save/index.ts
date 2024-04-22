import { SaveInputs } from "../job";
import { createTarFile } from "../tar";
import { createClient, createSafeKey, uploadFile } from "../r2";
import untildify from "untildify";

export async function save(
  inputs: SaveInputs,
  cacheArchiveFile = "action-cache-r2.tar.gz",
) {
  await createTarFile(
    inputs.paths.map((filePath) => {
      return filePath.startsWith("~") ? untildify(filePath) : filePath;
    }),
    cacheArchiveFile,
  );
  await uploadFile(
    createClient(inputs.config),
    inputs.config,
    createSafeKey(inputs.saveKey, inputs.config.bucketPathPrefix),
    cacheArchiveFile,
  );
}
