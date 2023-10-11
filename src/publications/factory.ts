import { Article } from 'src/article'
import { PublicationMetadata } from 'src/metadata'
import { DevToPublication } from './devTo'
import { HashnodePublication } from './hashnode'
import { MediumPublication } from './medium'
import { Publication } from './publication'

export class PublicationFactory {
  static create(
    publicationMetadata: Partial<PublicationMetadata>,
    article: Article
  ): Publication {
    switch (publicationMetadata.platform) {
      case 'hashnode': {
        if (publicationMetadata.publicationId)
          return new HashnodePublication({
            article,
            id: publicationMetadata.id,
            url: publicationMetadata.url,
            publicationId: publicationMetadata.publicationId,
            useAsMain: publicationMetadata.useAsMain ?? false
          })
        throw new Error(
          'Unable to build Hashnode publication, publicationId is missing.'
        )
      }
      case 'medium': {
        return new MediumPublication({
          article,
          id: publicationMetadata.id,
          url: publicationMetadata.url,
          publishStatus: publicationMetadata.publishStatus ?? 'public',
          useAsMain: publicationMetadata.useAsMain ?? false
        })
      }
      case 'devTo': {
        return new DevToPublication({
          article,
          id: publicationMetadata.id,
          url: publicationMetadata.url,
          published: publicationMetadata.published ?? true,
          useAsMain: publicationMetadata.useAsMain ?? false
        })
      }
      default:
        throw new Error(
          'Unable to build one publication as no platform identified for article ' +
            article.title
        )
    }
  }
}
