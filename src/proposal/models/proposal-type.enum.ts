import { registerEnumType } from '@nestjs/graphql';

export enum ProposalType {
  CreateFederationProposal = 'CreateFederationProposal',
  AddMemberProposal = 'AddMemberProposal',
  DeleteMemberProposal = 'DeleteMemberProposal',
  DissolveFederationProposal = 'DissolveFederationProposal',
  DissolveNetworkProposal = 'DissolveNetworkProposal',
}

registerEnumType(ProposalType, {
  name: 'ProposalType',
  description: '「提议」类型',
  valuesMap: {
    CreateFederationProposal: {
      description: '创建联盟时创建的提议',
    },
    AddMemberProposal: {
      description: '联盟添加组织时创建的提议',
    },
    DeleteMemberProposal: {
      description: '联盟驱逐组织时创建的提议',
    },
    DissolveFederationProposal: {
      description: '解散联盟的时候创建的提议',
    },
    DissolveNetworkProposal: {
      description: '释放网络时创建的提议',
    },
  },
});
