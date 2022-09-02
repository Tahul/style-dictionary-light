/*
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import chalk from 'chalk'
import { vi } from 'vitest'
import buildFile from '../src/buildFile'
import GroupMessages from '../src/utils/groupMessages'
import helpers from './__helpers'

function format() {
  return 'hi'
}

function nestedFormat() {
  return 'hi'
}

nestedFormat.nested = true

describe('buildFile', () => {
  beforeEach(async () => {
    await helpers.clearOutput()
  })

  afterEach(async () => {
    await helpers.clearOutput()
  })

  it('should error if format doesnt exist or isnt a function', () => {
    expect(
      buildFile.bind(null, { destination: '__tests__/__output/test.txt' }, {}, {})
    ).toThrow('Please enter a valid file format')
    expect(
      buildFile.bind(null, { destination: '__tests__/__output/test.txt', format: {} }, {}, {})
    ).toThrow('Please enter a valid file format')
    expect(
      buildFile.bind(null, { destination: '__tests__/__output/test.txt', format: [] }, {}, {})
    ).toThrow('Please enter a valid file format')
  })

  it('should error if destination doesnt exist or isnt a string', () => {
    expect(
      buildFile.bind(null, { format }, {}, {})
    ).toThrow('Please enter a valid destination')
    expect(
      buildFile.bind(null, { format, destination: [] }, {}, {})
    ).toThrow('Please enter a valid destination')
    expect(
      buildFile.bind(null, { format, destination: {} }, {}, {})
    ).toThrow('Please enter a valid destination')
  })

  describe('name collisions', () => {
    const destination = './__tests__/__output/test.collisions'
    const PROPERTY_NAME_COLLISION_WARNINGS = `${GroupMessages.GROUP.PropertyNameCollisionWarnings}:${destination}`
    const name = 'someName'
    const properties = {
      allProperties: [{
        name,
        path: ['some', 'name', 'path1'],
        value: 'value1',
      }, {
        name,
        path: ['some', 'name', 'path2'],
        value: 'value2',
      }],
    }
    it('should generate warning messages for output name collisions', () => {
      GroupMessages.clear(PROPERTY_NAME_COLLISION_WARNINGS)
      buildFile({ destination, format }, {}, properties)

      const collisions = properties.allProperties.map((properties) => {
        const propertyPathText = chalk.red(properties.path.join('.'))
        const valueText = chalk.red(properties.value)
        return `${propertyPathText}   ${valueText}`
      }).join('\n        ')
      const output = `Output name ${chalk.red.bold(name)} was generated by:\n        ${collisions}`
      const expectJSON = JSON.stringify([output])

      expect(GroupMessages.count(PROPERTY_NAME_COLLISION_WARNINGS)).toBe(1)
      expect(JSON.stringify(GroupMessages.fetchMessages(PROPERTY_NAME_COLLISION_WARNINGS))).toBe(expectJSON)
    })

    it('should not warn users if the format is a nested format', () => {
      console.log = vi.fn()
      buildFile({ destination, format: nestedFormat }, {}, properties)
      expect(console.log).toHaveBeenCalledWith(chalk.bold.green(`✔︎ ${destination}`))
    })
  })

  const destEmptyProperties = './__tests__/__output/test.emptyProperties'
  it('should warn when a file is not created because of empty properties', () => {
    const dictionary = {
      allProperties: [{
        name: 'someName',
        attributes: { category: 'category1' },
        path: ['some', 'name', 'path1'],
        value: 'value1',
      }],
    }

    const filter = function (prop) {
      return prop.attributes.category === 'category2'
    }

    buildFile({
      destination: destEmptyProperties,
      format,
      filter,
    }, {}, dictionary)
    expect(helpers.fileExists('__output/test.emptyProperties')).toBeFalsy()
  })

  it('should write to a file properly', () => {
    buildFile({
      destination: 'test.txt',
      format,
    }, {
      buildPath: '__tests__/__output/',
    }, {}
    )
    expect(helpers.fileExists('__output/test.txt')).toBeTruthy()
  })
})
