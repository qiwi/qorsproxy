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
