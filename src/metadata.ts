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
  coverImage?: string
  publications?: PublicationMetadata[]
}

export type Metadata = Record<string, any>

export interface MetadataObject {
  toMetadata(): Metadata
}
