import * as core from '@actions/core'

import { glob } from 'glob'

import { Article } from './article'

import simpleGit from 'simple-git'
import { GITHUB_ACTOR } from './utils/github'

const git = simpleGit()

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug(new Date().toTimeString())

    const searchPatterns = core.getInput('searchPatterns')
    const ignorePatterns = core.getInput('ignorePatterns')

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
            try {
              await publication.publish()
            } catch (error) {
              core.error(
                `Unable to publishing on ${publication.platform}, ${article.title}: ${error}`
              )
            }
          })
        )

        core.info('Updating article metadata for ' + markdownFile)
        article.write(markdownFile)
      }
    }

    await git.addConfig(
      'user.email',
      `${GITHUB_ACTOR!}@users.noreply.github.com`,
      false,
      'global'
    )
    await git.addConfig('user.name', GITHUB_ACTOR!, false, 'global')
    await git.raw(['add', '*.md', '*.png'])
    await git.raw(['commit', '--amend', '--no-edit'])
    await git.raw(['push', '--force-with-lease'])

    core.debug(new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
