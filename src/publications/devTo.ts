import { Article } from 'src/article'
import {
  Publication,
  PublicationCommonMetadata,
  PublicationInfo
} from './publication'

const DEVTO_API_ENDPOINT = 'https://dev.to/api'
const DEVTO_API_KEY = 'SjwQ8ed4BCz79jbFAVPQCY9d' // To be stored in secret

type ArticleResponse = {
  id: string
  url: string
}

export type DevToPublicationMetadata = PublicationCommonMetadata & {
  platform: 'devTo'
  published: boolean
}

export class DevToPublication extends Publication {
  published: boolean

  constructor(article: Article, published: boolean) {
    super(article)
    this.published = published
  }

  async create(): Promise<PublicationInfo> {
    const response = await this.fetchDevToApi<ArticleResponse>('articles', {
      method: 'POST',
      body: JSON.stringify({
        article: {
          title: this.article.title,
          published: this.published,
          canonical_url: this.article.canonicalUrl,
          body_markdown: this.article.content,
          tags: this.article.tags
        }
      })
    })
    return {
      id: response.id,
      url: response.url
    }
  }

  update(): Promise<PublicationInfo> {
    throw new Error('Method not implemented.')
  }

  async delete() {
    throw new Error('Method not implemented.')
  }

  toMetadata(): DevToPublicationMetadata {
    return {
      id: this.id,
      url: this.url,
      platform: 'devTo',
      published: this.published
    }
  }

  private async fetchDevToApi<T>(
    path: string,
    requestInit?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${DEVTO_API_ENDPOINT}/${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': DEVTO_API_KEY,
        Accept: 'application/vnd.forem.api-v1+json'
      },
      ...requestInit
    })

    if (response.ok) {
      return response.json()
    } else {
      throw new Error('Medium publication failed.')
    }
  }
}
