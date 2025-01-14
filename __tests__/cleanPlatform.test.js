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

describe('cleanPlatform', () => {
  let config
  let StyleDictionaryExtended
  beforeAll(async () => {
    config = await helpers.fileToJSON('__configs/test.json')
    StyleDictionaryExtended = StyleDictionary.extend(config)
  })

  beforeEach(async () => {
    await helpers.clearOutput()
  })

  afterEach(async () => {
    await helpers.clearOutput()
  })

  it('should delete the proper files', () => {
    StyleDictionaryExtended.buildPlatform('web')
    StyleDictionaryExtended.cleanPlatform('web')
    expect(helpers.fileDoesNotExist('__output/web/_icons.scss')).toBeTruthy()
    expect(helpers.fileDoesNotExist('__output/web/_styles.js')).toBeTruthy()
    expect(helpers.fileDoesNotExist('__output/web/_variables.scss')).toBeTruthy()
  })

  it('should delete android stuff', () => {
    StyleDictionaryExtended.buildPlatform('android')
    StyleDictionaryExtended.cleanPlatform('android')
    expect(helpers.fileDoesNotExist('__output/android/main/res/drawable-hdpi/flag_us.png')).toBeTruthy()
    expect(helpers.fileDoesNotExist('__output/android/main/res/drawable-xhdpi/flag_us.png')).toBeTruthy()
    expect(helpers.fileDoesNotExist('__output/android/colors.xml')).toBeTruthy()
    expect(helpers.fileDoesNotExist('__output/android/dimens.xml')).toBeTruthy()
    expect(helpers.fileDoesNotExist('__output/android/font_dimen.xml')).toBeTruthy()
  })

  it('should delete ios stuff', () => {
    StyleDictionaryExtended.buildPlatform('ios')
    StyleDictionaryExtended.cleanPlatform('ios')
    expect(helpers.fileDoesNotExist('__output/ios/style_dictionary.plist')).toBeTruthy()
    expect(helpers.fileDoesNotExist('__output/ios/style_dictionary.h')).toBeTruthy()
  })
})
