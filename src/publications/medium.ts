import * as core from '@actions/core'
import { buildMarkdownImage } from 'src/utils/markdown'
import {
  Publication,
  PublicationCommonMetadata,
  PublicationConstructorParams,
  PublicationInfo
} from './publication'

const API_ENDPOINT = 'https://api.medium.com/v1'
const API_KEY = core.getInput('mediumApiKey')

type User = {
  id: string
  username: string
  name: string
  url: string
  imageUrl: string
}

type Post = {
  id: string
  title: string
  authorId: string
  url: string
  canonicalUrl: string
  publishStatus: string
  license: string
  licenseUrl: string
  tags: string[]
}

type Response<T> = {
  data: T
}

type PublishStatus = 'public' | 'draft' | 'unlisted'

type GetMeResponse = Response<User>
type CreatePostResponse = Response<Post>

export type MediumPublicationMetadata = PublicationCommonMetadata & {
  platform: 'medium'
  publishStatus: 'public' | 'draft' | 'unlisted'
}

type MediumPublicationConstructorParams = Omit<
  PublicationConstructorParams,
  'platform'
> & {
  publishStatus: PublishStatus
}

export class MediumPublication extends Publication {
  publishStatus: PublishStatus

  constructor({
    article,
    id,
    url,
    publishStatus,
    useAsMain
  }: MediumPublicationConstructorParams) {
    super({ article, id, url, useAsMain, platform: 'medium' })
    this.publishStatus = publishStatus
  }

  async create(): Promise<PublicationInfo> {
    core.debug(`Creating article ${this.article.title} in Medium`)
    const currentUser = await this.getAuthenticatedUser()
    const response = await this.fetchMediumApi<CreatePostResponse>(
      `users/${currentUser.id}/posts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          title: this.article.title,
          contentFormat: 'markdown',
          content: this.transformedContent,
          canonicalUrl: this.article.canonicalUrl,
          tags: this.article.tags,
          publishStatus: this.publishStatus
        })
      }
    )
    return {
      id: response.data.id,
      url: response.data.url
    }
  }

  async update(): Promise<PublicationInfo> {
    core.error('Unable to update article in Medium. API not available...')
    return {
      id: this.id!,
      url: this.url!
    }
  }

  async delete(): Promise<void> {
    core.error('Unable to delete an article in Medium. API not available...')
    return Promise.resolve()
  }

  get transformedContent() {
    const transformedContent = super.transformedContent

    // Add cover image at the beginning of the content for Medium
    return this.article.coverImage
      ? buildMarkdownImage({
          imageUrl: this.article.coverImage,
          altText: 'Cover image'
        }).concat(`\n${transformedContent}`)
      : transformedContent
  }

  toMetadata(): MediumPublicationMetadata {
    return {
      id: this.id,
      url: this.url,
      platform: 'medium',
      publishStatus: this.publishStatus,
      ...(this.useAsMain ? { useAsMain: true } : {})
    }
  }

  private async getAuthenticatedUser() {
    const response = await this.fetchMediumApi<GetMeResponse>('me')
    return response.data
  }

  private async fetchMediumApi<T>(
    path: string,
    requestInit?: RequestInit
  ): Promise<T> {
    if (!API_KEY) {
      throw new Error('Unable to perform actions on Medium, API key missing')
    }
    const response = await fetch(`${API_ENDPOINT}/${path}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/vnd.forem.api-v1+json'
      },
      ...requestInit
    })

    if (response.ok) {
      return response.json()
    } else {
      console.log(response)
      throw new Error('Unable to fetch Medium API' + response.statusText)
    }
  }
}
