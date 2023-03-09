import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('minio', () => ({
  endPoint: env.MINIO_ENDPOINT || 'minio-apis.172.22.96.209.nip.io',
  accessKey: env.MINIO_ACCESS_KEY || 'yHipQwHiyFZWPM1L',
  secretKey: env.MINIO_SECRET_KEY || 'hYR8Zt6RJkVe6yMiyasA8wwkyv9RQoNm',
}));
