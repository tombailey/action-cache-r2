import { RestoreInputs } from "../job";
import { extractTarFile } from "../tar";
import {
  createClient,
  createSafeKey,
  doesExist,
  downloadFile,
  R2Client,
  R2Config,
} from "../r2";
import path from "path";

export async function findFirstExistingCacheKey(
  client: R2Client,
  config: R2Config,
  restoreKeys: string[],
): Promise<string | null> {
  for (const restoreKey of restoreKeys) {
    if (await doesExist(client, config, restoreKey)) {
      return restoreKey;
    }
  }
  return null;
}

export async function restore(
  inputs: RestoreInputs,
  cacheArchiveFile = "action-cache-r2.tar.gz",
) {
  const safeKeyToRestoreKey = Object.fromEntries(
    inputs.restoreKeys.map((restoreKey) => {
      return [
        createSafeKey(restoreKey, inputs.config.bucketPathPrefix),
        restoreKey,
      ];
    }),
  );

  const client = createClient(inputs.config);
  const relevantSafeKey = await findFirstExistingCacheKey(
    client,
    inputs.config,
    Object.keys(safeKeyToRestoreKey),
  );
  if (relevantSafeKey) {
    console.log(
      `Restoring cache with key ${safeKeyToRestoreKey[relevantSafeKey]}`,
    );
    await downloadFile(
      createClient(inputs.config),
      inputs.config,
      relevantSafeKey,
      cacheArchiveFile,
    );
    await extractTarFile(cacheArchiveFile, process.cwd());
  } else {
    console.warn("No relevant cache to restore");
  }
}
