import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractResolver } from './contract.resolver';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  providers: [ContractService, ContractResolver],
  imports: [MinioModule],
})
export class ContractModule {}
