# scl-lib

[![npm version](https://img.shields.io/npm/v/@openscd/scl-lib.svg)](https://www.npmjs.com/package/@openscd/scl-lib)
[![Test](https://github.com/openscd/scl-lib/actions/workflows/test-branch.yml/badge.svg)](https://github.com/openscd/scl-lib/actions/workflows/test-branch.yml)
[![Release](https://github.com/openscd/scl-lib/actions/workflows/release.yml/badge.svg)](https://github.com/openscd/scl-lib/actions/workflows/release.yml)
[![Released with release-please](https://img.shields.io/badge/released%20with-release--please-blue.svg)](https://github.com/googleapis/release-please)
[![License](https://img.shields.io/npm/l/@openscd/scl-lib.svg)](https://github.com/openscd/scl-lib/blob/main/LICENSE)

This repository - SclLib - is a collection of TypeScript functions, that allow to faster develop modules for SCL editing.

## Content

SclLib is primarily exporting functions, that allow to manipulate SCL elements.
There are various types of functions you can find in this library grouped into:

- <u>element creation</u>: Those functions are triggered by the wish to create a valid SCL element. Those functions do check primarily whether limitation to create such an element are met.

  - The input is the parent/ancestor element and and an options object defining a user-defined configuration of the element to be created.
  - The output is a delta compared to the current SCL

- <u>edit checks</u>: Those function are triggered by the wish to edit a specific SCL element, e.g. `GSEControl`.

  - The input is a delta to the actual SCL formulated as `SetAttributes`, `Insert` or `Remove`.
  - The output is a corrected delta formulated as an array of `SetAttributes`, `Insert` or `Remove`. The difference between the input and output contains expertise related to IEC 61850-6.

- <u>generators</u>: Generator functions that allow to dynamically create unique value such as MAC-addresses, APPID and others
