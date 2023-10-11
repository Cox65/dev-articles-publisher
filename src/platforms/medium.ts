import { BlogPlatform, CreatePostParams } from './platform'

const MEDIUM_API_ENDPOINT = 'https://api.medium.com/v1'
const MEDIUM_API_KEY =
  '2193a15246591dc6e3f40e02ba29ea9939ea9771ac704eba412cddeaa9cef7a92' // To be stored in secret
const MEDIUM_ME_RESOURCE = 'me'

export type MediumUser = {
  id: string
  username: string
  name: string
  url: string
  imageUrl: string
}

export type MediumResponse<T> = {
  data: T
}

export type MediumGetMeResponse = MediumResponse<MediumUser>

export class Medium extends BlogPlatform {
  async createPost({ metadata, markdownContent }: CreatePostParams) {
    const currentUser = await this.getAuthenticatedUser()
    const response = await this.fetchMediumApi(
      `users/${currentUser.id}/posts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MEDIUM_API_KEY}`
        },
        body: JSON.stringify({
          title: metadata.title,
          contentFormat: 'markdown',
          content: markdownContent,
          tags: metadata.tags
        })
      }
    )
    return ''
  }

  updatePost(params: CreatePostParams): Promise<string> {
    throw new Error('Method not implemented.')
  }
  deletePost(params: CreatePostParams): Promise<string> {
    throw new Error('Method not implemented.')
  }

  private async getAuthenticatedUser() {
    const response =
      await this.fetchMediumApi<MediumGetMeResponse>(MEDIUM_ME_RESOURCE)
    return response.data
  }

  private async fetchMediumApi<T>(
    path: string,
    requestInit?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${MEDIUM_API_ENDPOINT}/${path}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MEDIUM_API_KEY}`,
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
