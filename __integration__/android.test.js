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

import fs from 'fs-extra'
import { join } from 'pathe'
import StyleDictionary from '../src/index'
import { buildPath } from './_constants'

describe('integration', () => {
  describe('android', () => {
    StyleDictionary.extend({
      source: ['__integration__/tokens/**/*.json?(c)'],
      platforms: {
        android: {
          transformGroup: 'android',
          buildPath,
          files: [{
            destination: 'resources.xml',
            format: 'android/resources',
          }, {
            destination: 'resourcesWithReferences.xml',
            format: 'android/resources',
            options: {
              outputReferences: true,
            },
          }, {
            destination: 'colors.xml',
            format: 'android/resources',
            filter: {
              attributes: { category: 'color' },
            },
          }],
        },
      },
    }).buildAllPlatforms()

    describe('android/resources', () => {
      it('should match snapshot', () => {
        const output = fs.readFileSync(join(buildPath, 'resources.xml'), { encoding: 'UTF-8' })
        expect(output).toMatchSnapshot()
      })

      describe('with references', () => {
        const output = fs.readFileSync(join(buildPath, 'resourcesWithReferences.xml'), { encoding: 'UTF-8' })

        it('should match snapshot', () => {
          expect(output).toMatchSnapshot()
        })
      })

      describe('with filter', () => {
        const output = fs.readFileSync(join(buildPath, 'colors.xml'), { encoding: 'UTF-8' })

        it('should match snapshot', () => {
          expect(output).toMatchSnapshot()
        })
      })
    })
  })
})

afterAll(() => {
  fs.emptyDirSync(buildPath)
})
