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

import StyleDictionary from '../src/index'
import helpers from './__helpers'

describe('buildAllPlatforms', () => {
  beforeEach(async () => {
    await helpers.clearOutput()
  })

  afterEach(async () => {
    await helpers.clearOutput()
  })

  it('should work with json config', () => {
    const StyleDictionaryExtended = StyleDictionary.extend(helpers.resolveTestsPath('/__configs/test.json'))
    StyleDictionaryExtended.buildAllPlatforms()
    expect(helpers.fileExists('__output/web/_icons.css')).toBeTruthy()
    expect(helpers.fileExists('__output/android/colors.xml')).toBeTruthy()
  })

  it('should work with js config', () => {
    const StyleDictionaryExtended = StyleDictionary.extend(helpers.resolveTestsPath('/__configs/test.js'))
    StyleDictionaryExtended.buildAllPlatforms()
    expect(helpers.fileExists('__output/web/_icons.css')).toBeTruthy()
    expect(helpers.fileExists('__output/android/colors.xml')).toBeTruthy()
  })
})
