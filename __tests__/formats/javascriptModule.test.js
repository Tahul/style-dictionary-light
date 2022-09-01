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
import createJITI from 'jiti'
import helpers from '../__helpers'
import formats from '../../src/common/formats'
import createDictionary from '../../src/utils/createDictionary'
import createFormatArgs from '../../src/utils/createFormatArgs'

const file = {
  destination: '__output/',
  format: 'javascript/module',
  filter: {
    attributes: {
      category: 'color',
    },
  },
}

const properties = {
  color: {
    red: { value: '#FF0000' },
  },
}

const formatter = formats['javascript/module'].bind(file)
const dictionary = createDictionary({ properties })

describe('formats', () => {
  describe('javascript/module', () => {
    beforeEach(() => {
      helpers.clearOutput()
    })

    afterEach(() => {
      helpers.clearOutput()
    })

    it('should be a valid JS file', async () => {
      fs.writeFileSync('./__tests__/__output/output.js', formatter(createFormatArgs({
        dictionary,
        file,
        platform: {},
      }), {}, file))
      const test = createJITI(import.meta.url, { interopDefault: true })('../__output/output.js')

      expect(test.color.red.value).toEqual(dictionary.properties.color.red.value)
    })
  })
})
