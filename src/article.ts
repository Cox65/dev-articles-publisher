import * as fs from 'fs'
import {
  ArticleMetadata,
  MetadataObject,
  buildMarkdownMetadata,
  parseMarkdownMetadata,
  removeMetadata
} from './metadata'
import { PublicationFactory } from './publications/factory'
import { Publication } from './publications/publication'

export const TITLE_METADATA = 'title'
export const TAGS_METADATA = 'tags'
export const CANONICAL_URL_METADATA = 'canonicalUrl'

export class Article implements MetadataObject {
  title: string
  tags: string[]
  content: string
  canonicalUrl?: string
  publications: Publication[]

  constructor(filepath: string) {
    const fullContent = fs.readFileSync(filepath, 'utf8')
    const metadata = parseMarkdownMetadata(
      fullContent
    ) as Partial<ArticleMetadata>
    this.content = removeMetadata(fullContent)
    if (metadata.title) {
      this.title = metadata.title
    } else {
      throw Error(`No title provided in metadata for ${filepath}`)
    }
    this.canonicalUrl = metadata.canonicalUrl
    this.tags = metadata.tags ?? []
    this.publications = []
    if (metadata.publications) {
      metadata.publications.forEach(publicationMetadata => {
        try {
          this.publications.push(
            PublicationFactory.create(publicationMetadata, this)
          )
        } catch (e) {
          console.error(e)
        }
      })
    }
  }

  toMetadata(): ArticleMetadata {
    const result = {
      title: this.title,
      tags: this.tags && this.tags.length > 0 ? this.tags : undefined,
      canonicalUrl: this.canonicalUrl,
      publications:
        this.publications && this.publications.length > 0
          ? this.publications.map(publication => publication.toMetadata())
          : undefined
    }
    return result
  }

  write(filepath: string) {
    fs.writeFileSync(
      filepath,
      [buildMarkdownMetadata(this.toMetadata()), this.content].join('\n')
    )
  }
}
