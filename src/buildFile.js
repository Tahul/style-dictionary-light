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

import fs from 'node:fs'
import * as path from 'pathe'
import chalk from 'chalk'
import filterProperties from './filterProperties'
import GroupMessages from './utils/groupMessages'
import createFormatArgs from './utils/createFormatArgs'
import logger from './logger'

/**
 * Takes the style property object and a format and returns a
 * string that can be written to a file.
 * @memberOf StyleDictionary
 * @param {object} file
 * @param {object} platform
 * @param {object} dictionary
 * @returns {null}
 */
function buildFile(file = {}, platform = {}, dictionary = {}) {
  const { destination, filter } = file || {}
  let { format } = file || {}

  const silent = file?.silent || platform?.silent || false

  if (typeof format !== 'function')
    throw new Error('Please enter a valid file format')

  // get if the format is nested, this needs to be done before
  // the function is bound
  const nested = format.nested

  // to maintain backwards compatibility we bind the format to the file object
  format = format.bind(file)

  let fullDestination = destination
  const id = `${file?.format || ''}-${Date.now()}`

  // if there is a build path, prepend the full destination with it
  if (typeof destination === 'string' && platform.buildPath)
    fullDestination = platform.buildPath + fullDestination

  if (fullDestination && platform.write !== false) {
    const dirname = path.dirname(fullDestination)
    if (!fs.existsSync(dirname))
      fs.mkdirSync(dirname, { recursive: true })
  }

  const filteredProperties = filterProperties(dictionary, filter)
  const filteredDictionary = Object.assign({}, dictionary, {
    properties: filteredProperties.properties,
    allProperties: filteredProperties.allProperties,
    tokens: filteredProperties.properties,
    allTokens: filteredProperties.allProperties,
    // keep the unfiltered properties object for reference resolution
    _properties: dictionary.properties,
  })

  // if properties object is empty, return without creating a file
  if (
    filteredProperties.hasOwnProperty('properties')
    && Object.keys(filteredProperties.properties).length === 0
    && filteredProperties.properties.constructor === Object
  ) {
    const warnNoFile = `No properties for ${destination || id}. File not created.`
    !silent && logger().log(chalk.red(warnNoFile))
    return null
  }

  // Check for property name Collisions
  const nameCollisionObj = {}
  filteredProperties.allProperties && filteredProperties.allProperties.forEach((propertyData) => {
    const propertyName = propertyData.name
    if (!nameCollisionObj[propertyName])
      nameCollisionObj[propertyName] = []

    nameCollisionObj[propertyName].push(propertyData)
  })

  const PROPERTY_NAME_COLLISION_WARNINGS = `${GroupMessages.GROUP.PropertyNameCollisionWarnings}:${destination || id}`
  GroupMessages.clear(PROPERTY_NAME_COLLISION_WARNINGS)
  Object.keys(nameCollisionObj).forEach((propertyName) => {
    if (nameCollisionObj[propertyName].length > 1) {
      const collisions = nameCollisionObj[propertyName].map((properties) => {
        const propertyPathText = chalk.red(properties.path.join('.'))
        const valueText = chalk.red(properties.value)
        return `${propertyPathText}   ${valueText}`
      }).join('\n        ')
      GroupMessages.add(
        PROPERTY_NAME_COLLISION_WARNINGS,
        `Output name ${chalk.red.bold(propertyName)} was generated by:\n        ${collisions}`,
      )
    }
  })

  const propertyNamesCollisionCount = GroupMessages.count(PROPERTY_NAME_COLLISION_WARNINGS)

  // Allows disabling file writings
  const result = format(createFormatArgs({
    dictionary: filteredDictionary,
    platform,
    file,
  }), platform, file)

  // Supports `write` at `platform` and `file` level
  if (platform?.write !== false && file?.write !== false) {
    fs.writeFileSync(
      fullDestination,
      result,
    )
  }

  if (platform?.done && typeof platform?.done === 'function')
    platform?.done({ file, platform, dictionary, result })

  if (file?.done && typeof file?.done === 'function')
    file?.done({ file, platform, dictionary, result })

  const filteredReferencesCount = GroupMessages.count(GroupMessages.GROUP.FilteredOutputReferences)

  if (!silent) {
    // don't show name collision warnings for nested type formats
  // because they are not relevant.
    if ((nested || propertyNamesCollisionCount === 0) && filteredReferencesCount === 0) {
      logger().log(chalk.bold.green(`✔︎ ${fullDestination}`))
    }
    else {
      logger().log(`⚠️ ${fullDestination}`)
      if (propertyNamesCollisionCount > 0) {
        const propertyNamesCollisionWarnings = GroupMessages.fetchMessages(PROPERTY_NAME_COLLISION_WARNINGS).join('\n    ')
        const title = `While building ${chalk.red.bold(destination || id)}, token collisions were found; output may be unexpected.`
        const help = chalk.red([
          'This many-to-one issue is usually caused by some combination of:',
          '* conflicting or similar paths/names in property definitions',
          '* platform transforms/transformGroups affecting names, especially when removing specificity',
          '* overly inclusive file filters',
        ].join('\n    '))
        const warn = `${title}\n    ${propertyNamesCollisionWarnings}\n${help}`
        logger().log(chalk.red.bold(warn))
      }

      if (filteredReferencesCount > 0) {
        const filteredReferencesWarnings = GroupMessages.flush(GroupMessages.GROUP.FilteredOutputReferences).join('\n    ')
        const title = `While building ${chalk.red.bold(destination || id)}, filtered out token references were found; output may be unexpected. Here are the references that are used but not defined in the file`
        const help = chalk.red([
          'This is caused when combining a filter and `outputReferences`.',
        ].join('\n    '))
        const warn = `${title}\n    ${filteredReferencesWarnings}\n${help}`
        logger().log(chalk.red.bold(warn))
      }
    }
  }
}

export default buildFile
