import { Module } from '@nestjs/common';
import { ChaincodebuildService } from './chaincodebuild.service';
import { ChaincodebuildResolver } from './chaincodebuild.resolver';
import { MinioModule } from 'src/minio/minio.module';
import { NetworkModule } from 'src/network/network.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { ChaincodeModule } from 'src/chaincode/chaincode.module';

@Module({
  providers: [ChaincodebuildService, ChaincodebuildResolver],
  imports: [MinioModule, NetworkModule, OrganizationModule, ChaincodeModule],
})
export class ChaincodebuildModule {}
