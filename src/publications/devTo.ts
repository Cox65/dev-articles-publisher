import * as core from '@actions/core'
import {
  Publication,
  PublicationCommonMetadata,
  PublicationConstructorParams,
  PublicationInfo
} from './publication'

const DEVTO_API_ENDPOINT = 'https://dev.to/api'
const DEVTO_API_KEY = core.getInput('devToApiKey')

type ArticleResponse = {
  id: string
  url: string
}

export type DevToPublicationMetadata = PublicationCommonMetadata & {
  platform: 'devTo'
  published: boolean
}

type DevToPublicationConstructorParams = Omit<
  PublicationConstructorParams,
  'platform'
> & {
  published: boolean
}

export class DevToPublication extends Publication {
  published: boolean

  constructor({
    article,
    id,
    url,
    published
  }: DevToPublicationConstructorParams) {
    super({ article, id, url, platform: 'devTo' })
    this.published = published
  }

  async create(): Promise<PublicationInfo> {
    core.debug(`Creating article ${this.article.title} in DevTo`)
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

  async update(): Promise<PublicationInfo> {
    core.debug(`Updating article ${this.article.title} in DevTo`)
    const response = await this.fetchDevToApi<ArticleResponse>(
      `articles/${this.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          article: {
            title: this.article.title,
            published: this.published,
            canonical_url: this.article.canonicalUrl,
            body_markdown: this.article.content,
            tags: this.article.tags
          }
        })
      }
    )
    return {
      id: response.id,
      url: response.url
    }
  }

  async delete() {
    core.error('Unable to delete a DevTo article. API not implemented...')
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
    if (!DEVTO_API_KEY) {
      throw new Error('Unable to perform actions on DevTo, API key missing')
    }
    const response = await fetch(`${DEVTO_API_ENDPOINT}/${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': DEVTO_API_KEY,
        Accept: 'application/vnd.forem.api-v1+json'
      },
      ...requestInit
    })

    // Timeout to avoid too many requests throttling
    await new Promise(r => setTimeout(r, 1000))

    if (response.ok) {
      return response.json()
    } else {
      throw new Error('Medium publication failed.')
    }
  }
}
