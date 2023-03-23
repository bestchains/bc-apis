import { registerEnumType } from '@nestjs/graphql';

export enum ProposalType {
  CreateFederationProposal = 'CreateFederationProposal',
  AddMemberProposal = 'AddMemberProposal',
  DeleteMemberProposal = 'DeleteMemberProposal',
  DissolveFederationProposal = 'DissolveFederationProposal',
  DissolveNetworkProposal = 'DissolveNetworkProposal',
  ArchiveChannelProposal = 'ArchiveChannelProposal',
  UnarchiveChannelProposal = 'UnarchiveChannelProposal',
  DeployChaincodeProposal = 'DeployChaincodeProposal',
  UpgradeChaincodeProposal = 'UpgradeChaincodeProposal',
  UpdateChannelMemberProposal = 'UpdateChannelMemberProposal',
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
    ArchiveChannelProposal: {
      description: 'ArchiveChannelProposal',
    },
    UnarchiveChannelProposal: {
      description: 'UnarchiveChannelProposal',
    },
    DeployChaincodeProposal: {
      description: '创建合约时创建的提议',
    },
    UpgradeChaincodeProposal: {
      description: '更新合约时创建的提议',
    },
    UpdateChannelMemberProposal: {
      description: '通道邀请组织的提议',
    },
  },
});
