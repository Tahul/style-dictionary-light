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

import transformConfig from './transform/config'
import buildFiles from './buildFiles'
import performActions from './performActions'
import createDictionary from './utils/createDictionary'
import logger from './logger'

/**
 * Takes a platform and performs all transforms to
 * the tokens object (non-mutative) then
 * builds all the files and performs any actions. This is useful if you only want to
 * build the artifacts of one platform to speed up the build process.
 *
 * This method is also used internally in [buildAllPlatforms](#buildAllPlatforms) to
 * build each platform defined in the config.
 *
 * @static
 * @memberof module:style-dictionary
 * @param {string} platform - Name of the platform you want to build.
 * @returns {module:style-dictionary}
 * @example
 * ```js
 * StyleDictionary.buildPlatform('web');
 * ```
 * ```bash
 * $ style-dictionary build --platform web
 * ```
 */
function buildPlatform(platform) {
  if (!this.options || !(platform in (this.options.platforms || {})))
    throw new Error(`Platform "${platform}" does not exist`)

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
  // building and action methods.
  const dictionary = createDictionary({ properties }, platformConfig?.references || {})

  buildFiles(dictionary, platformConfig)
  performActions(dictionary, platformConfig)

  // For chaining
  return this
}

export default buildPlatform
