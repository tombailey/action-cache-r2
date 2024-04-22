import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3,
} from "@aws-sdk/client-s3";
import { createReadStream } from "node:fs";
import { writeFile, rm } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "path";

export function createSafeKey(
  cacheKey: string,
  bucketPathPrefix?: string | null,
): string {
  const encodedCacheKey = encodeURIComponent(cacheKey);
  return bucketPathPrefix
    ? path.join(bucketPathPrefix, encodedCacheKey)
    : encodedCacheKey;
}

export class FileNotFoundError extends Error {}

export type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  bucketPathPrefix: string | null;
};

export function createConfig(
  endpoint: string,
  accessKeyId: string,
  secretAccessKey: string,
  bucket: string,
  bucketPathPrefix: string | null = null,
): R2Config {
  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    bucketPathPrefix,
  };
}

export type R2Client = S3;

export function createClient(config: R2Config): R2Client {
  return new S3({
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    region: "auto",
  });
}

export async function doesExist(
  client: R2Client,
  config: R2Config,
  key: string,
) {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    if (error instanceof NotFound) {
      return false;
    } else {
      throw error;
    }
  }
}

export async function downloadFile(
  client: R2Client,
  config: R2Config,
  key: string,
  filePath: string,
) {
  const object = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
  if (object.Body === undefined) {
    throw new FileNotFoundError();
  } else if (object.Body instanceof Readable) {
    await writeFile(filePath, object.Body);
  } else {
    throw new Error("Invalid R2 response body");
  }
}

export async function uploadFile(
  client: R2Client,
  config: R2Config,
  key: string,
  filePath: string,
) {
  const fileStream = createReadStream(filePath);
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: fileStream,
      }),
    );
  } finally {
    fileStream.close();
  }
}

export async function moveFile(
  client: R2Client,
  config: R2Config,
  sourceKey: string,
  targetKey: string,
) {
  // CopyObjectCommand doesn't seem to work :(
  const filePath = "r2-cache.tmp";
  await downloadFile(client, config, sourceKey, filePath);
  await uploadFile(client, config, targetKey, filePath);
  await rm(filePath);
  await deleteFile(client, config, sourceKey);
}

export async function deleteFile(
  client: R2Client,
  config: R2Config,
  key: string,
) {
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}
