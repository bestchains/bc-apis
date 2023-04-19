import { registerEnumType } from '@nestjs/graphql';

export enum Lang {
  zh = 'zh',
  en = 'en',
}

registerEnumType(Lang, {
  name: 'Lang',
  description: '可切换的语言',
  valuesMap: {
    zh: {
      description: '中文',
    },
    en: {
      description: '英文',
    },
  },
});
