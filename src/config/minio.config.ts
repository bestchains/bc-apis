import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('minio', () => ({
  endPoint: env.MINIO_ENDPOINT || 'fabric-minio.baas-system.svc.cluster.local',
  accessKey: env.MINIO_ACCESS_KEY || 'ylc9dZGbZg2oYgnE',
  secretKey: env.MINIO_SECRET_KEY || 'ykCAHG3snLaToaRsbPo3rhCyZNqCKcIt',
}));
