import { Article } from 'src/article'
import {
  Publication,
  PublicationCommonMetadata,
  PublicationInfo
} from './publication'

const HASHNODE_API_ENDPOINT = 'https://api.hashnode.com'
const HASHNODE_API_KEY = '01196d42-9ee9-458c-a24e-87acf8d85885' // To be stored in secret

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

export class HashnodePublication extends Publication {
  publicationId: string

  constructor(article: Article, publicationId: string) {
    super(article)
    this.publicationId = publicationId
  }

  async create(): Promise<PublicationInfo> {
    const query =
      'mutation CreateArticle($input: CreateStoryInput!, $publicationId: String!){ createPublicationStory(input: $input, publicationId: $publicationId){ post { _id } } }'
    const response =
      await this.fetchHashnodeApi<CreatePublicationStoryResponse>(query, {
        publicationId: this.publicationId,
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
      id: response.data.createPublicationStory.post._id,
      url: 'TBD'
    }
  }

  update(): Promise<PublicationInfo> {
    throw new Error('Method not implemented.')
  }

  delete(): Promise<void> {
    throw new Error('Method not implemented.')
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
    const response = await fetch(`${HASHNODE_API_ENDPOINT}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: HASHNODE_API_KEY
      },
      method: 'POST',
      body: JSON.stringify({
        operationName: 'CreateArticle',
        query,
        variables
      })
    })

    if (response.ok) {
      return response.json()
    } else {
      console.log(await response.json())
      throw new Error('Hashnode publication failed: ' + response.statusText)
    }
  }
}
