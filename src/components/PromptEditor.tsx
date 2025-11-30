'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { PromptWithTags, Folder, Tag } from '@/types/database'
import { mockCreatePrompt, mockUpdatePrompt, mockDeletePrompt, mockCreateTag, mockAddPromptTags } from '@/lib/mockData'

interface PromptEditorProps {
  prompt: PromptWithTags | null
  folders: Folder[]
  allTags: Tag[]
  userId: string
  isNew: boolean
  onClose: () => void
  onSave: () => void
  onDelete: () => void
  onCopy: (prompt: PromptWithTags) => void
}

const PLATFORMS = ['ChatGPT', 'Claude', 'Midjourney', 'Gemini', 'Other']

export default function PromptEditor({
  prompt,
  folders,
  allTags,
  userId,
  isNew,
  onClose,
  onSave,
  onDelete,
  onCopy,
}: PromptEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState<string | null>(null)
  const [folderId, setFolderId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title)
      setContent(prompt.content)
      setPlatform(prompt.platform)
      setFolderId(prompt.folder_id)
      setNotes(prompt.notes || '')
      setSelectedTags(prompt.tags)
    } else {
      setTitle('')
      setContent('')
      setPlatform(null)
      setFolderId(null)
      setNotes('')
      setSelectedTags([])
    }
  }, [prompt])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!content.trim()) {
      toast.error('Please enter prompt content')
      return
    }

    setSaving(true)

    try {
      let promptId = prompt?.id

      if (isNew) {
        const newPrompt = await mockCreatePrompt({
          user_id: userId,
          title: title.trim(),
          content: content.trim(),
          platform,
          folder_id: folderId,
          notes: notes.trim() || null,
          usage_count: 0,
        })
        promptId = newPrompt.id
      } else {
        await mockUpdatePrompt(prompt!.id, {
          title: title.trim(),
          content: content.trim(),
          platform,
          folder_id: folderId,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
      }

      if (promptId && selectedTags.length > 0) {
        await mockAddPromptTags(promptId, selectedTags.map((t) => t.id))
      }

      toast.success(isNew ? 'Prompt created' : 'Prompt saved')
      onSave()
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAndCopy = async () => {
    await handleSave()
    if (prompt) {
      onCopy({ ...prompt, title, content, platform, folder_id: folderId, notes, tags: selectedTags })
    }
  }

  const handleDelete = async () => {
    if (!prompt) return

    try {
      await mockDeletePrompt(prompt.id)
      toast.success('Prompt deleted')
      onDelete()
    } catch (error) {
      toast.error('Failed to delete prompt')
    }
  }

  const addTag = async (tagName: string) => {
    const normalizedName = tagName.toLowerCase().trim()
    if (!normalizedName) return

    const existingTag = allTags.find((t) => t.name.toLowerCase() === normalizedName)
    
    if (existingTag) {
      if (!selectedTags.find((t) => t.id === existingTag.id)) {
        setSelectedTags([...selectedTags, existingTag])
      }
    } else {
      const newTag = await mockCreateTag(normalizedName)
      setSelectedTags([...selectedTags, newTag])
    }

    setTagInput('')
    setShowTagSuggestions(false)
  }

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId))
  }

  const filteredSuggestions = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.find((t) => t.id === tag.id)
  )

  return (
    <div className="w-[400px] bg-white border-l border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {isNew ? 'New Prompt' : 'Edit Prompt'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter prompt title..."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={8}
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can use variables like {'{{variable}}'}. You'll fill them in when you copy.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select
            value={platform || ''}
            onChange={(e) => setPlatform(e.target.value || null)}
            className="input-field"
          >
            <option value="">Select platform...</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Folder</label>
          <select
            value={folderId || ''}
            onChange={(e) => setFolderId(e.target.value || null)}
            className="input-field"
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="relative">
            <div className="input-field flex flex-wrap gap-1 min-h-[42px]">
              {selectedTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-sm"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    className="hover:text-primary-900"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value)
                  setShowTagSuggestions(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault()
                    addTag(tagInput)
                  }
                }}
                onFocus={() => setShowTagSuggestions(true)}
                placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
                className="flex-1 min-w-[100px] border-none outline-none text-sm p-0"
              />
            </div>
            {showTagSuggestions && (tagInput || filteredSuggestions.length > 0) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredSuggestions.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag(tag.name)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    {tag.name}
                  </button>
                ))}
                {tagInput && !allTags.find((t) => t.name.toLowerCase() === tagInput.toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-primary-600"
                  >
                    Create "{tagInput}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this prompt..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-primary bg-green-600 hover:bg-green-700"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleSaveAndCopy}
            disabled={saving}
            className="flex-1 btn-secondary"
          >
            Save & Copy
          </button>
        </div>

        {!isNew && (
          <>
            {showDeleteConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 btn-danger"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-red-600 hover:text-red-700 text-sm font-medium py-2"
              >
                Delete Prompt
              </button>
            )}
          </>
        )}

        {prompt && !isNew && (
          <p className="text-xs text-gray-400 text-center">
            Saved {format(new Date(prompt.updated_at), 'MMM d, yyyy h:mm a')}
          </p>
        )}
      </div>
    </div>
  )
}
