import * as core from '@actions/core'
import { replaceImagesPaths } from 'src/utils/markdown'
import {
  Publication,
  PublicationCommonMetadata,
  PublicationConstructorParams,
  PublicationInfo
} from './publication'

const HASHNODE_API_ENDPOINT = 'https://api.hashnode.com'
const HASHNODE_API_KEY = core.getInput('hashnodeApiKey')

export type DefaultHashnodeResponse = {
  code: number
  success: boolean
  message: string
}

export type CreatePublicationStoryResponse = {
  data: {
    createPublicationStory: DefaultHashnodeResponse & {
      post: {
        _id: string
      }
    }
  }
}

export type UpdateStoryResponse = {
  data: {
    updateStory: DefaultHashnodeResponse & {
      post: {
        _id: string
      }
    }
  }
}

export type HashnodePublicationMetadata = PublicationCommonMetadata & {
  platform: 'hashnode'
  publicationId?: string
}

type HashnodePublicationConstructorParams = Omit<
  PublicationConstructorParams,
  'platform'
> & {
  publicationId: string
}

export class HashnodePublication extends Publication {
  publicationId: string

  constructor({
    article,
    id,
    url,
    publicationId
  }: HashnodePublicationConstructorParams) {
    super({ article, id, url, platform: 'hashnode' })
    this.publicationId = publicationId
  }

  async create(): Promise<PublicationInfo> {
    core.debug(`Creating article ${this.article.title} in Hashnode`)
    const query =
      'mutation CreateArticle($input: CreateStoryInput!, $publicationId: String!){ createPublicationStory(input: $input, publicationId: $publicationId){ code success message post { _id } } }'
    const response =
      await this.fetchHashnodeApi<CreatePublicationStoryResponse>(query, {
        publicationId: this.publicationId,
        input: {
          title: this.article.title,
          coverImageURL: '',
          isPartOfPublication: {
            publicationId: this.publicationId
          },
          contentMarkdown: replaceImagesPaths(
            this.article.filepath,
            this.article.content
          ),
          tags: []
        }
      })
    return {
      id: response.data.createPublicationStory.post._id,
      url: 'TBD'
    }
  }

  async update(): Promise<PublicationInfo> {
    core.debug(`Updating article ${this.article.title} in Hashnode`)
    const query =
      'mutation UpdateArticle($postId: String!, $input: UpdateStoryInput!){ updateStory(postId: $postId, input: $input){ code success message post { _id } } }'
    const response = await this.fetchHashnodeApi<UpdateStoryResponse>(query, {
      postId: this.id,
      input: {
        title: this.article.title,
        isPartOfPublication: {
          publicationId: this.publicationId
        },
        contentMarkdown: this.article.content,
        tags: []
      }
    })

    return {
      id: response.data.updateStory.post._id,
      url: 'TBD'
    }
  }

  async delete(): Promise<void> {
    core.debug(`Deleting article ${this.article.title} in Hashnode`)
    const query =
      'mutation DeleteArticle($id: String!){ deletePost(id: $id){ code success message } }'
    const response = await this.fetchHashnodeApi<UpdateStoryResponse>(query, {
      id: this.id
    })
  }

  toMetadata(): HashnodePublicationMetadata {
    return {
      id: this.id,
      url: this.url,
      platform: 'hashnode',
      publicationId: this.publicationId
    }
  }

  private async fetchHashnodeApi<T>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    if (!HASHNODE_API_KEY) {
      throw new Error('Unable to perform actions on Hashnode, API key missing')
    }

    const response = await fetch(`${HASHNODE_API_ENDPOINT}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: HASHNODE_API_KEY
      },
      method: 'POST',
      body: JSON.stringify({
        query,
        variables
      })
    })

    if (response.ok) {
      return response.json()
    } else {
      throw new Error('Hashnode publication failed: ' + response.statusText)
    }
  }
}
