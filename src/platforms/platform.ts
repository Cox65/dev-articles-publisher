export type PlatformMetadata = {
  title: string
  tags: string[]
  canonicalUrl: string
}

export type CreatePostParams = {
  metadata: PlatformMetadata
  markdownContent: string
}

export abstract class BlogPlatform {
  abstract createPost(params: CreatePostParams): Promise<string>

  abstract updatePost(params: CreatePostParams): Promise<string>

  abstract deletePost(params: CreatePostParams): Promise<string>
}
