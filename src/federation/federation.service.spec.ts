import { Test, TestingModule } from '@nestjs/testing';
import { FederationService } from './federation.service';

describe('FederationService', () => {
  let service: FederationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FederationService],
    }).compile();

    service = module.get<FederationService>(FederationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
