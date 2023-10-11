import { MetadataObject, PublicationMetadata } from 'src/metadata'
import { Article } from '../article'

export type PublicationCommonMetadata = {
  id?: string
  url?: string
}

export type PublicationInfo = {
  id: string
  url: string
}

export type PublicationConstructorParams = {
  article: Article
  id?: string
  url?: string
  platform: Platform
}

export type Platform = 'hashnode' | 'medium' | 'devTo'

export abstract class Publication implements MetadataObject {
  platform: Platform
  article: Article
  id?: string
  url?: string

  constructor({ article, id, url, platform }: PublicationConstructorParams) {
    this.article = article
    this.id = id
    this.url = url
    this.platform = platform
  }

  async publish(): Promise<void> {
    const publicationInfo = !this.id ? await this.create() : await this.update()
    this.id = publicationInfo.id
    this.url = publicationInfo.url
  }

  abstract create(): Promise<PublicationInfo>

  abstract update(): Promise<PublicationInfo>

  abstract delete(): Promise<void>

  abstract toMetadata(): PublicationMetadata
}
