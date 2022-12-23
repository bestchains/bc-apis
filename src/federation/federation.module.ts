import { Module } from '@nestjs/common';
import { FederationService } from './federation.service';
import { FederationResolver } from './federation.resolver';

@Module({
  providers: [FederationResolver, FederationService],
})
export class FederationModule {}
