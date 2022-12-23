#!/usr/bin/env zx

import * as fs from 'fs';

const NM_RUN_PATH = 'node_modules/.bin/';
const SDK_FILE_PATH = 'static/client-sdk/sdk.ts';

await $`${NM_RUN_PATH}graphql-codegen`;

fs.writeFileSync(
  SDK_FILE_PATH,
  fs
    .readFileSync(SDK_FILE_PATH)
    .toString()
    .replace(
      'import useSWR,',
      `import useSWR from './useSWR';
import`,
    ),
);

await $`${NM_RUN_PATH}prettier --write \"static/client-sdk/*.ts\"`;
