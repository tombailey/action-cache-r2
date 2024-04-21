import { SaveInputs } from "../job";
import { createTarFile } from "../tar";
import { createClient, uploadFile } from "../r2";
import * as path from "path";
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
    inputs.config.bucketPathPrefix
      ? path.join(inputs.config.bucketPathPrefix, inputs.saveKey)
      : inputs.saveKey,
    cacheArchiveFile,
  );
}
