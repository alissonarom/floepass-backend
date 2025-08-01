import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (
  !R2_ENDPOINT ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  throw new Error("Credenciais do Cloudflare R2 não configuradas no .env");
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload de um arquivo para o bucket R2.
 * @param key - O nome do arquivo no bucket
 * @param body - O buffer do arquivo
 * @param contentType - O mimetype do arquivo (ex: 'image/jpeg')
 */
export const uploadToStorage = (
  key: string,
  body: Buffer,
  contentType: string
) => {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  return s3Client.send(command);
};

/**
 * Deleta um objeto do bucket R2.
 * @param key - O nome do arquivo no bucket
 */
export const deleteFromStorage = (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  return s3Client.send(command);
};

/**
 * Retorna a URL pública de um objeto no bucket.
 * @param key - O nome do arquivo no bucket
 * @returns A URL pública completa do objeto.
 */
export const getPublicUrl = (key: string): string => {
  if (!process.env.R2_PUBLIC_URL) {
    console.warn(
      "R2_PUBLIC_URL não está definida. Retornando apenas a chave do objeto."
    );
    return key;
  }
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};
