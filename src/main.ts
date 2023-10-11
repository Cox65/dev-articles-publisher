import * as core from '@actions/core'

import { glob } from 'glob'

import { Article } from './article'

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
      core.info('Reading article from ' + markdownFile)
      const article = new Article(markdownFile)

      if (article.publications) {
        await Promise.all(
          article.publications.map(async publication => {
            core.info('Publishing ' + publication.constructor.name)
            await publication.publish()
          })
        )

        core.info('Updating article metadata for ' + markdownFile)
        article.write(markdownFile)
      }
    }

    // Timeout required by Dev.to API to avoid Too many requests
    await new Promise(r => setTimeout(r, 1000))

    core.debug(new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
