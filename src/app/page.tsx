'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PromptList from '@/components/PromptList'
import PromptEditor from '@/components/PromptEditor'
import VariableModal from '@/components/VariableModal'
import toast from 'react-hot-toast'
import type { Folder, Tag, PromptWithTags, TagWithCount } from '@/types/database'
import { User } from '@supabase/supabase-js'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<TagWithCount[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [prompts, setPrompts] = useState<PromptWithTags[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<PromptWithTags[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [showUnsorted, setShowUnsorted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'alpha' | 'usage'>('recent')
  const [selectedPrompt, setSelectedPrompt] = useState<PromptWithTags | null>(null)
  const [isNewPrompt, setIsNewPrompt] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [variableModal, setVariableModal] = useState<{
    isOpen: boolean
    variables: string[]
    prompt: PromptWithTags | null
  }>({ isOpen: false, variables: [], prompt: null })

  const router = useRouter()
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    if (!user) return

    const [foldersRes, tagsRes, promptsRes, promptTagsRes] = await Promise.all([
      supabase.from('folders').select('*').eq('user_id', user.id).order('sort_order'),
      supabase.from('tags').select('*').eq('user_id', user.id),
      supabase.from('prompts').select('*').eq('user_id', user.id),
      supabase.from('prompt_tags').select('*'),
    ])

    if (foldersRes.data) setFolders(foldersRes.data as Folder[])
    if (tagsRes.data) setAllTags(tagsRes.data as Tag[])
    
    if (promptsRes.data && promptTagsRes.data && tagsRes.data) {
      const promptsData = promptsRes.data as any[]
      const promptTagsData = promptTagsRes.data as any[]
      const tagsData = tagsRes.data as Tag[]
      
      const promptsWithTags: PromptWithTags[] = promptsData.map((prompt) => {
        const promptTagIds = promptTagsData
          .filter((pt) => pt.prompt_id === prompt.id)
          .map((pt) => pt.tag_id)
        const promptTags = tagsData.filter((tag) => promptTagIds.includes(tag.id))
        return { ...prompt, tags: promptTags }
      })
      setPrompts(promptsWithTags)

      const tagCounts: Record<string, number> = {}
      promptTagsData.forEach((pt) => {
        tagCounts[pt.tag_id] = (tagCounts[pt.tag_id] || 0) + 1
      })
      const tagsWithCount: TagWithCount[] = tagsData.map((tag) => ({
        ...tag,
        count: tagCounts[tag.id] || 0,
      }))
      setTags(tagsWithCount.filter((t) => t.count > 0))
    }
  }, [user, supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, fetchData])

  useEffect(() => {
    let filtered = prompts

    if (selectedFolderId) {
      filtered = filtered.filter((p) => p.folder_id === selectedFolderId)
    } else if (showUnsorted) {
      filtered = filtered.filter((p) => !p.folder_id)
    } else if (selectedTagId) {
      filtered = filtered.filter((p) => p.tags.some((t) => t.id === selectedTagId))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
      )
    }

    setFilteredPrompts(filtered)
  }, [prompts, selectedFolderId, selectedTagId, showUnsorted, searchQuery])

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g
    const matches: string[] = []
    let match
    while ((match = regex.exec(content)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1])
      }
    }
    return matches
  }

  const handleCopyPrompt = async (prompt: PromptWithTags) => {
    const variables = extractVariables(prompt.content)

    if (variables.length > 0) {
      setVariableModal({ isOpen: true, variables, prompt })
    } else {
      await copyToClipboard(prompt.content, prompt.id)
    }
  }

  const copyToClipboard = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
      
      const currentPrompt = prompts.find((p) => p.id === promptId)
      if (currentPrompt) {
        await supabase
          .from('prompts')
          .update({ usage_count: currentPrompt.usage_count + 1 } as any)
          .eq('id', promptId)
      }
      
      fetchData()
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleVariableSubmit = async (values: Record<string, string>) => {
    if (!variableModal.prompt) return

    let content = variableModal.prompt.content
    Object.entries(values).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    })

    await copyToClipboard(content, variableModal.prompt.id)
    setVariableModal({ isOpen: false, variables: [], prompt: null })
  }

  const getViewTitle = () => {
    if (selectedFolderId) {
      return folders.find((f) => f.id === selectedFolderId)?.name || 'Folder'
    }
    if (selectedTagId) {
      return `Tag: ${tags.find((t) => t.id === selectedTagId)?.name || 'Tag'}`
    }
    if (showUnsorted) return 'Unsorted'
    return 'All Prompts'
  }

  const handleSelectAllPrompts = () => {
    setSelectedFolderId(null)
    setSelectedTagId(null)
    setShowUnsorted(false)
  }

  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedTagId(null)
    setShowUnsorted(false)
  }

  const handleSelectTag = (tagId: string | null) => {
    setSelectedTagId(tagId)
    setSelectedFolderId(null)
    setShowUnsorted(false)
  }

  const handleSelectUnsorted = () => {
    setShowUnsorted(true)
    setSelectedFolderId(null)
    setSelectedTagId(null)
  }

  const handleNewPrompt = () => {
    setSelectedPrompt(null)
    setIsNewPrompt(true)
    setShowEditor(true)
  }

  const handleSelectPrompt = (prompt: PromptWithTags) => {
    setSelectedPrompt(prompt)
    setIsNewPrompt(false)
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setSelectedPrompt(null)
    setIsNewPrompt(false)
  }

  const handleEditorSave = () => {
    fetchData()
    handleEditorClose()
  }

  const handleEditorDelete = () => {
    fetchData()
    handleEditorClose()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        user={user}
        folders={folders}
        tags={tags}
        selectedFolderId={selectedFolderId}
        selectedTagId={selectedTagId}
        showUnsorted={showUnsorted}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectAllPrompts={handleSelectAllPrompts}
        onSelectFolder={handleSelectFolder}
        onSelectTag={handleSelectTag}
        onSelectUnsorted={handleSelectUnsorted}
        onFoldersChange={fetchData}
      />

      <PromptList
        prompts={filteredPrompts}
        folders={folders}
        selectedPromptId={selectedPrompt?.id || null}
        viewTitle={getViewTitle()}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onSelectPrompt={handleSelectPrompt}
        onCopyPrompt={handleCopyPrompt}
        onNewPrompt={handleNewPrompt}
      />

      {showEditor && user && (
        <PromptEditor
          prompt={selectedPrompt}
          folders={folders}
          allTags={allTags}
          userId={user.id}
          isNew={isNewPrompt}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
          onDelete={handleEditorDelete}
          onCopy={handleCopyPrompt}
        />
      )}

      <VariableModal
        isOpen={variableModal.isOpen}
        variables={variableModal.variables}
        onSubmit={handleVariableSubmit}
        onClose={() => setVariableModal({ isOpen: false, variables: [], prompt: null })}
      />
    </div>
  )
}
