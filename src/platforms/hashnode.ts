import * as core from '@actions/core'
import { BlogPlatform, CreatePostParams } from './platform'

const HASHNODE_API_ENDPOINT = 'https://api.hashnode.com'
const HASHNODE_API_KEY = '01196d42-9ee9-458c-a24e-87acf8d85885' // To be stored in secret

export type HashnodeStoryInputParams = {
  title: string
  markdownContent: string
  tags: string[]
  canonicalUrl: string
  publicationId: string
}

export type UpdateHashnodeStoryInputParams = HashnodeStoryInputParams & {
  id: string
}

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

export class Hashnode extends BlogPlatform {
  createPost(params: CreatePostParams): Promise<string> {
    throw new Error('Method not implemented.')
  }
  updatePost(params: CreatePostParams): Promise<string> {
    throw new Error('Method not implemented.')
  }
  deletePost(params: CreatePostParams): Promise<string> {
    throw new Error('Method not implemented.')
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

export const createHashnodeStory = async ({
  title,
  publicationId,
  markdownContent,
  canonicalUrl,
  tags
}: HashnodeStoryInputParams) => {
  const query =
    'mutation createPublicationStory($input: CreateStoryInput!, $publicationId: String!){ createPublicationStory(input: $input, publicationId: $publicationId){ code success message post { _id } } }'

  const response = await fetchHashnodeApi<CreatePublicationStoryResponse>(
    query,
    {
      publicationId,
      input: {
        title,
        isPartOfPublication: {
          publicationId
        },
        contentMarkdown: markdownContent,
        tags
      }
    }
  )
  return response.data.createPublicationStory.post._id
}

export const updateHashnodeStory = async ({
  id,
  title,
  publicationId,
  markdownContent,
  tags
}: UpdateHashnodeStoryInputParams) => {
  core.info('Updating story with id:' + id)
  const query =
    'mutation updateStory($postId: String!, $input: UpdateStoryInput!){ updateStory(postId: $postId, input: $input){ code success message post { _id } } }'

  const response = await fetchHashnodeApi<UpdateStoryResponse>(query, {
    postId: id,
    input: {
      title,
      isPartOfPublication: {
        publicationId
      },
      contentMarkdown: markdownContent,
      tags
    }
  })
  return response.data.updateStory.post._id
}
