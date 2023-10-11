import * as yaml from 'js-yaml'
import path from 'path'
import { Metadata } from 'src/metadata'
import { buildGithubFileUrl } from './github'

export type MarkdownImageProps = {
  imageUrl: string
  altText: string
}

export const IMAGE_REGEX = /!\[(?<altText>[^\]]*)\]\((?<imagePath>[^)]*)\)/g
export const METADATA_REGEX = /^---([\s\S]*?)---/
export const TITLE_REGEX = /# (?<title>.*)/

export const removeMetadata = (markdown: string) =>
  markdown.replace(METADATA_REGEX, '')

export const findTitle = (markdown: string) =>
  markdown.match(TITLE_REGEX)?.groups?.title

export const removeTitleTag = (markdown: string) =>
  markdown.replace(TITLE_REGEX, '')

export const parseMarkdownMetadata = (markdown: string): unknown => {
  const metadataRegex = METADATA_REGEX
  const metadataMatch = markdown.match(metadataRegex)

  if (!metadataMatch) {
    return {}
  }
  const result = yaml.load(metadataMatch[1])
  return result
}

export const buildMarkdownMetadata = (metadata: Metadata): string => {
  return `---
${yaml.dump(metadata, { condenseFlow: true })}---`
}

export const buildMarkdownImage = ({ imageUrl, altText }: MarkdownImageProps) =>
  `![${altText}](${imageUrl})`

export const replaceImagesPaths = (
  markdownFilePath: string,
  markdownContent: string
) => {
  const matches = [...markdownContent.matchAll(IMAGE_REGEX)]
  return matches.reduce((transformedContent, match) => {
    const { altText, imagePath } = match.groups!
    if (!/^(https?|ftp|file|data):/i.test(imagePath)) {
      // Not an URL
      return transformedContent.replace(
        match[0],
        buildMarkdownImage({
          altText,
          imageUrl: buildGithubFileUrl(
            imagePath.startsWith('/')
              ? imagePath.slice(1)
              : path.join(path.dirname(markdownFilePath), imagePath),
            'raw'
          )
        })
      )
    }
    return transformedContent
  }, markdownContent)
}
