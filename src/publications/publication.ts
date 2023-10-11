import { MetadataObject, PublicationMetadata } from 'src/metadata'
import {
  findTitle,
  removeTitleTag,
  replaceImagesPaths
} from 'src/utils/markdown'
import { Article } from '../article'

export type PublicationCommonMetadata = {
  id?: string
  url?: string
  useAsMain?: boolean
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
  useAsMain: boolean
}

export type Platform = 'hashnode' | 'medium' | 'devTo'

export abstract class Publication implements MetadataObject {
  platform: Platform
  useAsMain: boolean = false
  article: Article
  id?: string
  url?: string

  constructor({
    article,
    id,
    url,
    platform,
    useAsMain
  }: PublicationConstructorParams) {
    this.article = article
    this.id = id
    this.url = url
    this.platform = platform
    this.useAsMain = useAsMain
  }

  async publish(): Promise<void> {
    const publicationInfo = !this.id ? await this.create() : await this.update()
    this.id = publicationInfo.id
    this.url = publicationInfo.url
  }

  get transformedContent() {
    const result = replaceImagesPaths(
      this.article.filepath,
      this.article.content
    )
    return findTitle(this.article.content) === this.article.title
      ? removeTitleTag(result)
      : result
  }

  abstract create(): Promise<PublicationInfo>

  abstract update(): Promise<PublicationInfo>

  abstract delete(): Promise<void>

  abstract toMetadata(): PublicationMetadata
}
