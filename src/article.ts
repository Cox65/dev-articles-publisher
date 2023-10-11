import * as fs from 'fs'
import { ArticleMetadata, MetadataObject } from './metadata'
import { PublicationFactory } from './publications/factory'
import { Publication } from './publications/publication'
import {
  buildMarkdownMetadata,
  findTitle,
  parseMarkdownMetadata,
  removeMetadata
} from './utils/markdown'

export const TITLE_METADATA = 'title'
export const TAGS_METADATA = 'tags'
export const CANONICAL_URL_METADATA = 'canonicalUrl'

export class Article implements MetadataObject {
  filepath: string
  title: string
  tags: string[]
  content: string
  coverImage?: string
  canonicalUrl?: string
  publications: Publication[]

  constructor(filepath: string) {
    this.filepath = filepath
    const fullContent = fs.readFileSync(filepath, 'utf8')
    const metadata = parseMarkdownMetadata(
      fullContent
    ) as Partial<ArticleMetadata>
    this.content = removeMetadata(fullContent)
    const title = metadata.title ? metadata.title : findTitle(this.content)
    if (title) this.title = title
    else throw new Error('Unable to find a title for this article')
    this.coverImage = metadata.coverImage
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
        this.publications.sort((a, b) => {
          return Number(b.useAsMain) - Number(a.useAsMain)
        })
      })
    }
  }

  toMetadata(): ArticleMetadata {
    const result = {
      title: this.title,
      tags: this.tags && this.tags.length > 0 ? this.tags : undefined,
      canonicalUrl: this.canonicalUrl,
      coverImage: this.coverImage,
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

  async publish() {
    for (const publication of this.publications) {
      console.info('Publishing ' + publication.constructor.name)
      try {
        await publication.publish()
        if (publication.useAsMain) {
          this.canonicalUrl = publication.url!
        }
      } catch (error) {
        console.error(
          `Unable to publish on ${publication.platform}, ${this.title}: ${error}`
        )
      }
    }
  }
}
