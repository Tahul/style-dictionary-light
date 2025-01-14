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

import createDictionary from './utils/createDictionary'
import transformConfig from './transform/config'
import cleanFiles from './cleanFiles'
import cleanDirs from './cleanDirs'
import cleanActions from './cleanActions'
import logger from './logger'

/**
 * Takes a platform and performs all transforms to
 * the tokens object (non-mutative) then
 * cleans all the files and performs the undo method of any [actions](actions.md).
 *
 * @static
 * @memberof module:style-dictionary
 * @param {string} platform
 * @returns {module:style-dictionary}
 */
function cleanPlatform(platform) {
  if (!this.options || !(platform in (this.options.platforms || {})))
    throw new Error(`Platform ${platform} doesn't exist`)

  let properties

  // We don't want to mutate the original object
  const platformConfig = transformConfig(this.options.platforms[platform], this, platform)

  if (!platformConfig?.silent)
    logger().log(`\n${platform}`)

  // We need to transform the object before we resolve the
  // variable names because if a value contains concatenated
  // values like "1px solid {color.border.base}" we want to
  // transform the original value (color.border.base) before
  // replacing that value in the string.

  // eslint-disable-next-line prefer-const
  properties = this.exportPlatform(platform)

  // This is the dictionary object we pass to the file
  // cleaning and action methods.
  const dictionary = createDictionary({ properties }, platformConfig?.references || {})

  // We clean files first, then actions, ...and then directories?
  cleanFiles(dictionary, platformConfig)
  cleanActions(dictionary, platformConfig)
  cleanDirs(dictionary, platformConfig)

  // For chaining
  return this
}

export default cleanPlatform
