import type { Folder, Prompt, Tag, PromptWithTags, TagWithCount } from '@/types/database'

const MOCK_USER_ID = 'demo-user-123'

const initialFolders: Folder[] = [
  { id: '1', user_id: MOCK_USER_ID, name: 'Marketing', sort_order: 0, created_at: new Date().toISOString() },
  { id: '2', user_id: MOCK_USER_ID, name: 'Sales', sort_order: 1, created_at: new Date().toISOString() },
  { id: '3', user_id: MOCK_USER_ID, name: 'Customer Support', sort_order: 2, created_at: new Date().toISOString() },
]

const initialTags: Tag[] = [
  { id: 'tag-1', user_id: MOCK_USER_ID, name: 'content' },
  { id: 'tag-2', user_id: MOCK_USER_ID, name: 'blog' },
  { id: 'tag-3', user_id: MOCK_USER_ID, name: 'email' },
  { id: 'tag-4', user_id: MOCK_USER_ID, name: 'outreach' },
  { id: 'tag-5', user_id: MOCK_USER_ID, name: 'support' },
  { id: 'tag-6', user_id: MOCK_USER_ID, name: 'response' },
]

const initialPrompts: PromptWithTags[] = [
  {
    id: 'p-1',
    user_id: MOCK_USER_ID,
    folder_id: '1',
    title: 'Blog Post Outline',
    content: 'Create a detailed outline for a blog post about {{topic}}. Include an engaging introduction, 5 main sections with subpoints, and a conclusion with a call to action.',
    platform: 'ChatGPT',
    notes: 'Great for brainstorming blog ideas',
    usage_count: 5,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [initialTags[0], initialTags[1]],
  },
  {
    id: 'p-2',
    user_id: MOCK_USER_ID,
    folder_id: '2',
    title: 'Cold Email Sequence',
    content: 'Write a 3-email cold outreach sequence for {{company}} targeting {{audience}}. Email 1 should introduce the problem, Email 2 should present the solution, Email 3 should create urgency.',
    platform: 'ChatGPT',
    notes: 'Remember to personalize for each recipient',
    usage_count: 12,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [initialTags[2], initialTags[3]],
  },
  {
    id: 'p-3',
    user_id: MOCK_USER_ID,
    folder_id: '3',
    title: 'Customer Complaint Response',
    content: 'You are a customer support agent for {{company}}. Write a professional and empathetic response to a customer who is upset about {{issue}}. Acknowledge their frustration, apologize, and offer a concrete solution.',
    platform: 'Claude',
    notes: 'Prioritize empathy and clear next steps',
    usage_count: 8,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [initialTags[4], initialTags[5]],
  },
  {
    id: 'p-4',
    user_id: MOCK_USER_ID,
    folder_id: '1',
    title: 'Product Comparison Article',
    content: 'Write a comprehensive comparison article between {{product1}} and {{product2}}. Include a feature table, pros/cons, and a conclusion on which is best for {{use_case}}.',
    platform: 'Midjourney',
    notes: null,
    usage_count: 3,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [initialTags[0]],
  },
]

function initializeMockData() {
  if (!localStorage.getItem('mockPrompts')) {
    localStorage.setItem('mockFolders', JSON.stringify(initialFolders))
    localStorage.setItem('mockTags', JSON.stringify(initialTags))
    localStorage.setItem('mockPrompts', JSON.stringify(initialPrompts))
    localStorage.setItem('mockPromptTags', JSON.stringify(
      [
        { prompt_id: 'p-1', tag_id: 'tag-1' },
        { prompt_id: 'p-1', tag_id: 'tag-2' },
        { prompt_id: 'p-2', tag_id: 'tag-3' },
        { prompt_id: 'p-2', tag_id: 'tag-4' },
        { prompt_id: 'p-3', tag_id: 'tag-5' },
        { prompt_id: 'p-3', tag_id: 'tag-6' },
        { prompt_id: 'p-4', tag_id: 'tag-1' },
      ]
    ))
  }
}

export async function mockFetchData() {
  initializeMockData()

  const folders = JSON.parse(localStorage.getItem('mockFolders') || '[]') as Folder[]
  const tags = JSON.parse(localStorage.getItem('mockTags') || '[]') as Tag[]
  const prompts = JSON.parse(localStorage.getItem('mockPrompts') || '[]') as Prompt[]
  const promptTags = JSON.parse(localStorage.getItem('mockPromptTags') || '[]')

  const promptsWithTags: PromptWithTags[] = prompts.map((prompt) => {
    const promptTagIds = promptTags.filter((pt: any) => pt.prompt_id === prompt.id).map((pt: any) => pt.tag_id)
    const promptTagsList = tags.filter((tag) => promptTagIds.includes(tag.id))
    return { ...prompt, tags: promptTagsList }
  })

  const tagCounts: Record<string, number> = {}
  promptTags.forEach((pt: any) => {
    tagCounts[pt.tag_id] = (tagCounts[pt.tag_id] || 0) + 1
  })
  const tagsWithCount: TagWithCount[] = tags.map((tag) => ({
    ...tag,
    count: tagCounts[tag.id] || 0,
  }))

  return {
    folders,
    tags: tagsWithCount.filter((t) => t.count > 0),
    allTags: tags,
    prompts: promptsWithTags,
  }
}

export async function mockCreateFolder(name: string) {
  const folders = JSON.parse(localStorage.getItem('mockFolders') || '[]') as Folder[]
  const newFolder: Folder = {
    id: 'f-' + Date.now(),
    user_id: MOCK_USER_ID,
    name,
    sort_order: folders.length,
    created_at: new Date().toISOString(),
  }
  folders.push(newFolder)
  localStorage.setItem('mockFolders', JSON.stringify(folders))
  return newFolder
}

export async function mockUpdateFolder(id: string, name: string) {
  const folders = JSON.parse(localStorage.getItem('mockFolders') || '[]') as Folder[]
  const index = folders.findIndex((f) => f.id === id)
  if (index !== -1) {
    folders[index].name = name
    localStorage.setItem('mockFolders', JSON.stringify(folders))
  }
}

export async function mockDeleteFolder(id: string) {
  const folders = JSON.parse(localStorage.getItem('mockFolders') || '[]') as Folder[]
  const prompts = JSON.parse(localStorage.getItem('mockPrompts') || '[]') as Prompt[]
  
  const filteredFolders = folders.filter((f) => f.id !== id)
  const updatedPrompts = prompts.map((p) => (p.folder_id === id ? { ...p, folder_id: null } : p))
  
  localStorage.setItem('mockFolders', JSON.stringify(filteredFolders))
  localStorage.setItem('mockPrompts', JSON.stringify(updatedPrompts))
}

export async function mockCreatePrompt(prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>) {
  const prompts = JSON.parse(localStorage.getItem('mockPrompts') || '[]') as Prompt[]
  const newPrompt: Prompt = {
    ...prompt,
    id: 'p-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  prompts.push(newPrompt)
  localStorage.setItem('mockPrompts', JSON.stringify(prompts))
  return newPrompt
}

export async function mockUpdatePrompt(id: string, updates: Partial<Prompt>) {
  const prompts = JSON.parse(localStorage.getItem('mockPrompts') || '[]') as Prompt[]
  const index = prompts.findIndex((p) => p.id === id)
  if (index !== -1) {
    prompts[index] = { ...prompts[index], ...updates, updated_at: new Date().toISOString() }
    localStorage.setItem('mockPrompts', JSON.stringify(prompts))
  }
}

export async function mockDeletePrompt(id: string) {
  const prompts = JSON.parse(localStorage.getItem('mockPrompts') || '[]') as Prompt[]
  const promptTags = JSON.parse(localStorage.getItem('mockPromptTags') || '[]')
  
  const filteredPrompts = prompts.filter((p) => p.id !== id)
  const filteredTags = promptTags.filter((pt: any) => pt.prompt_id !== id)
  
  localStorage.setItem('mockPrompts', JSON.stringify(filteredPrompts))
  localStorage.setItem('mockPromptTags', JSON.stringify(filteredTags))
}

export async function mockCreateTag(name: string) {
  const tags = JSON.parse(localStorage.getItem('mockTags') || '[]') as Tag[]
  const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase())
  if (existing) return existing

  const newTag: Tag = {
    id: 'tag-' + Date.now(),
    user_id: MOCK_USER_ID,
    name,
  }
  tags.push(newTag)
  localStorage.setItem('mockTags', JSON.stringify(tags))
  return newTag
}

export async function mockAddPromptTags(promptId: string, tagIds: string[]) {
  const promptTags = JSON.parse(localStorage.getItem('mockPromptTags') || '[]')
  
  const filtered = promptTags.filter((pt: any) => pt.prompt_id !== promptId)
  const newTags = tagIds.map((tagId) => ({ prompt_id: promptId, tag_id: tagId }))
  
  localStorage.setItem('mockPromptTags', JSON.stringify([...filtered, ...newTags]))
}

export async function mockUpdateUsageCount(promptId: string) {
  const prompts = JSON.parse(localStorage.getItem('mockPrompts') || '[]') as Prompt[]
  const index = prompts.findIndex((p) => p.id === promptId)
  if (index !== -1) {
    prompts[index].usage_count = (prompts[index].usage_count || 0) + 1
    localStorage.setItem('mockPrompts', JSON.stringify(prompts))
  }
}
