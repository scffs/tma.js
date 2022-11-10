# twa-init-data <sup><img src="https://static.npmjs.com/255a118f56f5346b97e56325a1217a16.svg" alt="drawing" width="20"/></sup>

[npm-badge]: https://img.shields.io/npm/v/twa-init-data?logo=npm

[npm-link]: https://npmjs.com/package/twa-init-data

[size-badge]: https://img.shields.io/bundlephobia/minzip/twa-init-data

[license-badge]: https://img.shields.io/github/license/telegram-web-apps/init-data-ts

[tree-shaking-badge]: https://img.shields.io/badge/Tree%20Shaking-enabled-success

[tree-shaking-link]: https://webpack.js.org/guides/tree-shaking/

[gh-org-badge]: https://img.shields.io/badge/-Ecosystem_Component-%23555?logo=github

[gh-org-link]: https://github.com/Telegram-Web-Apps

[![Ecosystem Component][gh-org-badge]][gh-org-link]
[![Tree Shaking][tree-shaking-badge]][tree-shaking-link]
[![NPM][npm-badge]][npm-link]
![Size][size-badge]
![License][license-badge]

TypeScript isomorphic library to make work with Telegram Web Apps init data
easier. Could be used both in browser and Node JS.

## Installation

```bash  
npm i twa-init-data
```  

or

```bash  
yarn add twa-init-data
```

## Usage

First thing which is required to know, is this library has peer dependency
called `crypto-js` which provides crypto algorithms used during init data
validation.

In case, you need only parsing utilities (for example, in browser),
you have no need to install this dependency as long as it is not imported
in parsing files. In this case, you have to follow the only 1 rule - do not
import from `twa-init-data/validate` because this will lead to `crypto-js`
import and will result in error.

If init data validation is needed, you have to install `crypto-js` dependency
by yourself.

### Parsing

This library contains function called `extractInitDataFromSearchParams` which is
able to extract init data information from some string value (which is usually
placed in URLSearchParams).

Here comes the example of usage:

```typescript
import {extractInitDataFromSearchParams} from 'twa-init-data';

// Lets imagine, we have init data in raw format like this. Web Apps are
// sending it in the exact same format.
const initDataRaw = 'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2';

// Extract init data.
console.log(extractInitDataFromSearchParams(initDataRaw));

// Output:
// {
//   authDate: 2022-09-10T01:00:48.000Z,
//   hash: 'c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
//   queryId: 'AAHdF6IQAAAAAN0XohDhrOrc',
//   user: {
//     id: 279058397,
//     firstName: 'Vladislav',
//     lastName: 'Kibenko',
//     username: 'vdkfrost',
//     languageCode: 'ru',
//     isPremium: true
//   }
// }
```

Function extracts required parameters and automatically validates their types.
It will throw an error in case, some property has invalid type or value.

Pay attention to the import - we imported from root directory of library which
does not include validation functionality. It allows us not to install
`crypto-js` package.

### Validation

In case, validation functionality is required, it is necessary to install
`crypto-js` package.

To validate init data sign, function `validate` is used. It expects passing init
data presented in raw format (search params) and throws an error in case,
something is wrong. To see full list of errors, please, check function's JSDoc.

It does not return any result.

```typescript
import {validate} from 'twa-init-data/validate';

const initDataRaw = 'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2';
const secretToken = '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8';

validate(initDataRaw, secretToken);
```

By default, function checks init data expiration. Default expiration duration
is 1 day (86_400 seconds). It is recommended to always check init data
expiration as long as it could be stolen, but still valid. To disable this
feature, use third function argument:

```typescript
import {validate} from 'twa-init-data/validate';

const initDataRaw = 'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2';
const secretToken = '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8';

validate(initDataRaw, secretToken, {expiresIn: 0});
```