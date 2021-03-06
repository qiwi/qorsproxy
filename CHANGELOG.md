## [2.4.11](https://github.com/qiwi/qorsproxy/compare/v2.4.10...v2.4.11) (2021-06-19)

## [2.4.10](https://github.com/qiwi/qorsproxy/compare/v2.4.9...v2.4.10) (2021-06-18)


### Bug Fixes

* fix internal modules refs ([13b5a83](https://github.com/qiwi/qorsproxy/commit/13b5a83474b9122b23fa6203cebb586a926e5b8b))

## [2.4.9](https://github.com/qiwi/qorsproxy/compare/v2.4.8...v2.4.9) (2021-06-18)


### Bug Fixes

* avoid --experimental-json-modules, read pkg.json via fs ([376e8fd](https://github.com/qiwi/qorsproxy/commit/376e8fdb439b559e0b586f57b49c698bc9e7854f))

## [2.4.8](https://github.com/qiwi/qorsproxy/compare/v2.4.7...v2.4.8) (2021-06-18)


### Bug Fixes

* fix cli entry point ([6d7bd2a](https://github.com/qiwi/qorsproxy/commit/6d7bd2a95920b8a6dd509ca37d341703acf7592f))


### Code Refactoring

* drop support of Node.js <= 12.12 ([9e3af7f](https://github.com/qiwi/qorsproxy/commit/9e3af7f62b8f08e07b4e6c4109937fcc8d2bee63))


### BREAKING CHANGES

* require native esm/mjs modules support

## [2.4.7](https://github.com/qiwi/qorsproxy/compare/v2.4.6...v2.4.7) (2021-06-17)


### Bug Fixes

* fix cjs entry point ext ([cf8bfed](https://github.com/qiwi/qorsproxy/commit/cf8bfed7ebe25719dd8b0b2914addb4174c5f138))


### Code Refactoring

* separate cli, cjs and mjs entry points ([5dc1369](https://github.com/qiwi/qorsproxy/commit/5dc13690379e1647a8c2172d3685547aef4a5cb7))


### BREAKING CHANGES

* repacked as mjs module

## [2.4.6](https://github.com/qiwi/qorsproxy/compare/v2.4.5...v2.4.6) (2021-06-17)


### Bug Fixes

* **deps:** update deps, fix vuls ([1991bd6](https://github.com/qiwi/qorsproxy/commit/1991bd68ebc7fe924a919e55f358fe277b986dbc))

## [2.4.5](https://github.com/qiwi/qorsproxy/compare/v2.4.4...v2.4.5) (2021-02-11)


### Bug Fixes

* fix container loading ([629e94f](https://github.com/qiwi/qorsproxy/commit/629e94f822ca1187dd19cc3a2d47c42d4e9f4c3a)), closes [#55](https://github.com/qiwi/qorsproxy/issues/55)

## [2.4.4](https://github.com/qiwi/qorsproxy/compare/v2.4.3...v2.4.4) (2021-01-28)


### Bug Fixes

* migrate from lodash-es to lodash ([f03717d](https://github.com/qiwi/qorsproxy/commit/f03717dc25733878659d0d814a636bc9c122f595))

## [2.4.3](https://github.com/qiwi/qorsproxy/compare/v2.4.2...v2.4.3) (2021-01-27)


### Bug Fixes

* **deps:** update dependency meow to v9 ([cdff4f8](https://github.com/qiwi/qorsproxy/commit/cdff4f89aa5438f85b69ba2128ddae982b6998c0))

## [2.4.2](https://github.com/qiwi/qorsproxy/compare/v2.4.1...v2.4.2) (2020-11-05)


### Performance Improvements

* **package:** deps revision ([8f26535](https://github.com/qiwi/qorsproxy/commit/8f26535c5f4258c05a8e408d562f6e6bfb8cfda5))

## [2.4.1](https://github.com/qiwi/qorsproxy/compare/v2.4.0...v2.4.1) (2020-09-30)


### Performance Improvements

* **deps:** updated http-status-codes ([#46](https://github.com/qiwi/qorsproxy/issues/46)) ([d97e045](https://github.com/qiwi/qorsproxy/commit/d97e04530ad348f44565938c17c489aec9e7d884))

# [2.4.0](https://github.com/qiwi/qorsproxy/compare/v2.3.0...v2.4.0) (2020-09-25)


### Features

* added version printing on start ([#44](https://github.com/qiwi/qorsproxy/issues/44)) ([b710f4c](https://github.com/qiwi/qorsproxy/commit/b710f4ccfd9404b14c5feb8cc94cd9ae1e448969)), closes [#43](https://github.com/qiwi/qorsproxy/issues/43)

# [2.3.0](https://github.com/qiwi/qorsproxy/compare/v2.2.1...v2.3.0) (2020-09-24)


### Features

* introduce https support ([#40](https://github.com/qiwi/qorsproxy/issues/40)) ([55b0af5](https://github.com/qiwi/qorsproxy/commit/55b0af5353480e9bbaf2d0af90249ba0f7c1d000))

## [2.2.1](https://github.com/qiwi/qorsproxy/compare/v2.2.0...v2.2.1) (2020-05-26)


### Performance Improvements

* **package:** up deps ([7d044ed](https://github.com/qiwi/qorsproxy/commit/7d044eda1ca0a9d1d8eb75511dfc2cbda9c2090a))

# [2.2.0](https://github.com/qiwi/qorsproxy/compare/v2.1.0...v2.2.0) (2019-09-15)


### Features

* print error details to log ([ee2a5f2](https://github.com/qiwi/qorsproxy/commit/ee2a5f2)), closes [#34](https://github.com/qiwi/qorsproxy/issues/34)

# [2.1.0](https://github.com/qiwi/qorsproxy/compare/v2.0.1...v2.1.0) (2019-09-05)


### Bug Fixes

* **logger:** handle error stack traces ([31344bf](https://github.com/qiwi/qorsproxy/commit/31344bf)), closes [#31](https://github.com/qiwi/qorsproxy/issues/31)


### Features

* **config:** add rules.interceptions validation ([e54eeab](https://github.com/qiwi/qorsproxy/commit/e54eeab))
* **config:** let rules be a map ([645350a](https://github.com/qiwi/qorsproxy/commit/645350a)), closes [#26](https://github.com/qiwi/qorsproxy/issues/26)

## [2.0.1](https://github.com/qiwi/qorsproxy/compare/v2.0.0...v2.0.1) (2019-08-31)


### Bug Fixes

* support empty header values ([3c799d3](https://github.com/qiwi/qorsproxy/commit/3c799d3))
* **mutator:** normalize headers ([392511b](https://github.com/qiwi/qorsproxy/commit/392511b)), closes [#27](https://github.com/qiwi/qorsproxy/issues/27)

# [2.0.0](https://github.com/qiwi/qorsproxy/compare/v1.5.4...v2.0.0) (2019-08-29)


### Features

* add qorsproxy bin alias ([97c1334](https://github.com/qiwi/qorsproxy/commit/97c1334)), closes [#28](https://github.com/qiwi/qorsproxy/issues/28) [#30](https://github.com/qiwi/qorsproxy/issues/30)


### Performance Improvements

* invoke esm at the entry point ([0c6d8dd](https://github.com/qiwi/qorsproxy/commit/0c6d8dd))


### BREAKING CHANGES

* app.js is not entry point anymore, refer to qorsproxy bin or index.js instead

## [1.5.4](https://github.com/qiwi/qorsproxy/compare/v1.5.3...v1.5.4) (2019-08-16)


### Bug Fixes

* **package:** fix vulnerabilities, up deps ([e1c7b46](https://github.com/qiwi/qorsproxy/commit/e1c7b46))

## [1.5.3](https://github.com/qiwi/qorsproxy/compare/v1.5.2...v1.5.3) (2019-07-05)


### Bug Fixes

* **customAuth:** transmit all headers after auth to target endpoint ([6781b97](https://github.com/qiwi/qorsproxy/commit/6781b97)), closes [#23](https://github.com/qiwi/qorsproxy/issues/23)

## [1.5.2](https://github.com/qiwi/qorsproxy/compare/v1.5.1...v1.5.2) (2019-07-05)


### Bug Fixes

* **customAuth:** transmit body to target endpoint ([fde7155](https://github.com/qiwi/qorsproxy/commit/fde7155)), closes [#21](https://github.com/qiwi/qorsproxy/issues/21)

## [1.5.1](https://github.com/qiwi/qorsproxy/compare/v1.5.0...v1.5.1) (2019-07-01)


### Bug Fixes

* **package:** up deps, fix vulnerabilities ([9e8bdc3](https://github.com/qiwi/qorsproxy/commit/9e8bdc3))

# [1.5.0](https://github.com/qiwi/qorsproxy/compare/v1.4.1...v1.5.0) (2019-07-01)


### Features

* **readme:** mention customAuthorization ([619afd8](https://github.com/qiwi/qorsproxy/commit/619afd8))

## [1.4.1](https://github.com/qiwi/qorsproxy/compare/v1.4.0...v1.4.1) (2019-07-01)


### Bug Fixes

* array headers processing ([810ca86](https://github.com/qiwi/qorsproxy/commit/810ca86))

# [1.4.0](https://github.com/qiwi/qorsproxy/compare/v1.3.1...v1.4.0) (2018-12-20)


### Features

* **memo:** replace errored responses with success stubs ([5f74816](https://github.com/qiwi/qorsproxy/commit/5f74816))

## [1.3.1](https://github.com/qiwi/qorsproxy/compare/v1.3.0...v1.3.1) (2018-12-20)


### Performance Improvements

* **memo:** collect res data from res.piped ([b2fd51a](https://github.com/qiwi/qorsproxy/commit/b2fd51a))

# [1.3.0](https://github.com/qiwi/qorsproxy/compare/v1.2.2...v1.3.0) (2018-12-19)


### Features

* add memoize middleware ([a90b20c](https://github.com/qiwi/qorsproxy/commit/a90b20c)), closes [#10](https://github.com/qiwi/qorsproxy/issues/10)

## [1.2.2](https://github.com/qiwi/qorsproxy/compare/v1.2.1...v1.2.2) (2018-12-04)


### Performance Improvements

* migrate to yargs ([1e42ded](https://github.com/qiwi/qorsproxy/commit/1e42ded))

## [1.2.1](https://github.com/qiwi/qorsproxy/compare/v1.2.0...v1.2.1) (2018-11-15)


### Performance Improvements

* replace deprecated Buffer methods ([9104163](https://github.com/qiwi/qorsproxy/commit/9104163))

# [1.2.0](https://github.com/qiwi/qorsproxy/compare/v1.1.1...v1.2.0) (2018-11-14)


### Features

* **middleware:** Add customAuthorization middleware ([0a41072](https://github.com/qiwi/qorsproxy/commit/0a41072))

## [1.1.1](https://github.com/qiwi/qorsproxy/compare/v1.1.0...v1.1.1) (2018-07-07)


### Performance Improvements

* **container:** tune up constructor ([c16a3e3](https://github.com/qiwi/qorsproxy/commit/c16a3e3))

# [1.1.0](https://github.com/qiwi/qorsproxy/compare/v1.0.0...v1.1.0) (2018-06-20)


### Features

* **servlet/health:** migrate to [@qiwi](https://github.com/qiwi)/health-indicator, add `critical` flag support, `deps` & etc ([b64aac6](https://github.com/qiwi/qorsproxy/commit/b64aac6))

# 1.0.0 (2018-06-15)


### Bug Fixes

* **dailyRotateFile:** correct filename pattern and migrate to `winston` v3 ([87d83c5](https://github.com/qiwi/qorsproxy/commit/87d83c5))
* **pipe:** pass body to request ([bdec2f3](https://github.com/qiwi/qorsproxy/commit/bdec2f3))


### Features

* **logger:** add option alias `filename` for `name` ([0f16f41](https://github.com/qiwi/qorsproxy/commit/0f16f41))
