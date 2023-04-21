import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractResolver } from './contract.resolver';
import { MinioModule } from 'src/minio/minio.module';
import { ChaincodebuildModule } from 'src/chaincodebuild/chaincodebuild.module';

@Module({
  providers: [ContractService, ContractResolver],
  imports: [MinioModule, ChaincodebuildModule],
})
export class ContractModule {}
