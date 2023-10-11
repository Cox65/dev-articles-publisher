import * as yaml from 'js-yaml'
import { DevToPublicationMetadata } from './publications/devTo'
import { HashnodePublicationMetadata } from './publications/hashnode'
import { MediumPublicationMetadata } from './publications/medium'

export type PublicationMetadata =
  | HashnodePublicationMetadata
  | MediumPublicationMetadata
  | DevToPublicationMetadata

export type ArticleMetadata = {
  title: string
  tags?: string[]
  canonicalUrl?: string
  publications?: PublicationMetadata[]
}

type Metadata = Record<string, any>

export interface MetadataObject {
  toMetadata(): Metadata
}

const METADATA_REGEX = /^---([\s\S]*?)---/

export const removeMetadata = (markdown: string) =>
  markdown.replace(METADATA_REGEX, '')

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
${yaml.dump(metadata)}---`
}
