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
import glob from 'fast-glob'
import resolveFileContent from '../resolveFileContent'
import deepExtend from './deepExtend'

function traverseObj(obj, fn) {
  for (const key in obj) {
    // eslint-disable-next-line  no-useless-call
    fn.apply(null, [obj, key, obj[key]])
    if (obj[key] && typeof obj[key] === 'object')
      traverseObj(obj[key], fn)
  }
}

/**
 * Takes an array of json files and merges
 * them together. Optionally does a deep extend.
 * @private
 * @param {string[]} arr - Array of paths to json (or node modules that export objects) files
 * @param {boolean} [deep] - If it should perform a deep merge
 * @param {Function} collision - A function to be called when a name collision happens that isn't a normal deep merge of objects
 * @param {boolean} [source] - If json files are "sources", tag properties
 * @param {object[]} [parsers] - Custom file parsers
 * @returns {object}
 */
function combineJSON(arr, deep, collision, source, parsers = []) {
  let i
  let files = []
  const to_ret = {}

  for (i = 0; i < arr.length; i++) {
    const new_files = glob.sync(arr[i], {}).reverse()
    files = files.concat(new_files)
  }

  for (i = 0; i < files.length; i++) {
    const filePath = files[i]

    const resolvedPath = path.isAbsolute(files[i])
      ? files[i]
      : path.resolve(process.cwd(), files[i])

    let file_content = null

    try {
      // Iterate over custom parsers, if the file path matches the parser's
      // pattern regex, use it's parse function to generate the object
      parsers.forEach(({ pattern, parse }) => {
        if (resolvedPath.match(pattern)) {
          file_content = parse({
            contents: fs.readFileSync(resolvedPath, { encoding: 'UTF-8' }),
            filePath: resolvedPath,
          })
        }
      })

      // If there is no file_content then no custom parser ran on that file
      if (!file_content) {
        const _content = resolveFileContent(resolvedPath)

        file_content = deepExtend([file_content, _content])
      }
    }
    catch (e) {
      e.message = `Failed to load or parse JSON or JS Object: ${e.message}`
      throw e
    }

    // Add some side data on each property to make filtering easier
    traverseObj(file_content, (obj) => {
      if (obj.hasOwnProperty('value') && !obj.filePath) {
        obj.filePath = filePath

        obj.isSource = !!(source || source === undefined)
      }
    })

    if (deep)
      deepExtend([to_ret, file_content], collision)
    else
      Object.assign(to_ret, file_content)
  }

  return to_ret
}

export default combineJSON
