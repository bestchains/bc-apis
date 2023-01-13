import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteResolver } from './vote.resolver';

@Module({
  providers: [VoteService, VoteResolver],
})
export class VoteModule {}
