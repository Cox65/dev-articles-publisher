import * as yaml from 'js-yaml'

type MarkdownMetadata = Record<string, string>

const METADATA_REGEX = /^---([\s\S]*?)---/

export const parseMarkdownMetadata = (markdown: string): unknown => {
  const metadataRegex = METADATA_REGEX
  const metadataMatch = markdown.match(metadataRegex)

  if (!metadataMatch) {
    return {}
  }
  const result = yaml.load(metadataMatch[1])

  console.log(result)

  return result
}

const buildMarkdownMetadata = (metadata: MarkdownMetadata): string => {
  return `---
${Object.entries(metadata)
  .map(([key, value]) => key + ': ' + value)
  .join('\n')}
---`
}

export const replaceMetadata = (
  markdown: string,
  metadata: MarkdownMetadata
): string => {
  return markdown.replace(METADATA_REGEX, buildMarkdownMetadata(metadata))
}
