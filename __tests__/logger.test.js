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

import buildFiles from '../src/buildFiles'
import cleanFiles from '../src/cleanFiles'
import helpers from './__helpers'

const dictionary = {
  properties: {
    foo: 'bar',
  },
}

const platform = {
  silent: true,
  files: [
    {
      destination: '__tests__/__output/test.json',
      format(dictionary) {
        return JSON.stringify(dictionary.properties)
      },
    },
  ],
}

describe('cleanFiles', () => {
  beforeEach(async () => {
    await helpers.clearOutput()
  })

  afterEach(async () => {
    await helpers.clearOutput()
  })

  it('it should not log if logger paused', () => {
    // TODO
    buildFiles(dictionary, platform)
    cleanFiles(dictionary, platform)
  })
})
