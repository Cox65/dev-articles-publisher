import * as core from '@actions/core'
import * as fs from 'fs'

import { glob } from 'glob'

import { parseMarkdownMetadata } from './utils/markdown'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug(new Date().toTimeString())

    const searchPatterns = 'articles/**/*.md'
    const ignorePatterns = 'node_modules'

    const markdownFiles = await glob(searchPatterns, {
      ignore: ignorePatterns
    })

    for (let i = 0; i < markdownFiles.length; i++) {
      const markdownFile = markdownFiles[i]
      core.info('Processing ' + markdownFile)
      const templateFileContent = fs.readFileSync(markdownFile, 'utf8')

      const metadata = parseMarkdownMetadata(templateFileContent)
    }

    // Timeout required by Dev.to API to avoid Too many requests
    await new Promise(r => setTimeout(r, 1000))

    core.debug(new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
