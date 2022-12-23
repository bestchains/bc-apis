# bc-apis

## Description

Composited APIs for fabric resource APIs.

## Installation

This project uses [pnpm](https://pnpm.io) to manage dependencies, we also recommend installing [ni](https://github.com/antfu/ni) to help switching between repos using different package managers. ni also provides the handy nr command which running npm scripts easier.

```bash
$ npm i pnpm @antfu/ni zx -g
$ ni
```

[zx](https://github.com/google/zx) is Google's open source javascript scripting tool, which will be used when generating sdk in our project.


## Running the app

```bash
# development
$ nr start

# watch mode
$ nr start:dev

# production mode
$ nr start:prod
```
