const DEVTO_API_ENDPOINT = 'https://dev.to/api'
const DEVTO_API_KEY = 'SjwQ8ed4BCz79jbFAVPQCY9d' // To be stored in secret

export type CreateArticleParams = {
  title: string
  published: boolean
  markdownContent: string
  tags: string[]
  canonicalUrl: string
}

const fetchDevToApi = async <T>(
  path: string,
  requestInit?: RequestInit
): Promise<T> => {
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

export const createArticle = async ({
  title,
  published,
  markdownContent,
  tags,
  canonicalUrl
}: CreateArticleParams) => {
  const response = await fetchDevToApi('articles', {
    method: 'POST',
    body: JSON.stringify({
      article: {
        title,
        published,
        canonical_url: canonicalUrl,
        body_markdown: markdownContent,
        tags
      }
    })
  })
  console.log(response)
}
