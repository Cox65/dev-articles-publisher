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

export abstract class Publication implements MetadataObject {
  article: Article
  id?: string
  url?: string

  constructor(article: Article) {
    this.article = article
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
