import { Article } from 'src/article'
import {
  Publication,
  PublicationCommonMetadata,
  PublicationInfo
} from './publication'

const API_ENDPOINT = 'https://api.medium.com/v1'
const API_KEY =
  '2193a15246591dc6e3f40e02ba29ea9939ea9771ac704eba412cddeaa9cef7a92' // To be stored in secret

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

export class MediumPublication extends Publication {
  publishStatus: PublishStatus

  constructor(article: Article, publishStatus: PublishStatus) {
    super(article)
    this.publishStatus = publishStatus
  }

  async create(): Promise<PublicationInfo> {
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
          content: this.article.content,
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

  update(): Promise<PublicationInfo> {
    throw new Error('Method not implemented.')
  }

  delete(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  toMetadata(): MediumPublicationMetadata {
    return {
      id: this.id,
      url: this.url,
      platform: 'medium',
      publishStatus: this.publishStatus
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
      throw new Error('Unable to fetch Medium API')
    }
  }
}
