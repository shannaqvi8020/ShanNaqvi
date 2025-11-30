'use client'

import { formatDistanceToNow } from 'date-fns'
import type { PromptWithTags, Folder } from '@/types/database'

interface PromptListProps {
  prompts: PromptWithTags[]
  folders: Folder[]
  selectedPromptId: string | null
  viewTitle: string
  sortBy: 'recent' | 'alpha' | 'usage'
  onSortChange: (sort: 'recent' | 'alpha' | 'usage') => void
  onSelectPrompt: (prompt: PromptWithTags) => void
  onCopyPrompt: (prompt: PromptWithTags) => void
  onNewPrompt: () => void
}

export default function PromptList({
  prompts,
  selectedPromptId,
  viewTitle,
  sortBy,
  onSortChange,
  onSelectPrompt,
  onCopyPrompt,
  onNewPrompt,
}: PromptListProps) {
  const sortedPrompts = [...prompts].sort((a, b) => {
    switch (sortBy) {
      case 'alpha':
        return a.title.localeCompare(b.title)
      case 'usage':
        return b.usage_count - a.usage_count
      case 'recent':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }
  })

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{viewTitle}</h2>
          <button onClick={onNewPrompt} className="btn-primary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Prompt
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'recent' | 'alpha' | 'usage')}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="recent">Recent</option>
            <option value="alpha">A-Z</option>
            <option value="usage">Most Used</option>
          </select>
          <span className="ml-auto text-sm text-gray-500">
            {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedPrompts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-500">No prompts yet</p>
            <button onClick={onNewPrompt} className="mt-2 text-primary-600 hover:text-primary-700 font-medium">
              Create your first prompt
            </button>
          </div>
        ) : (
          sortedPrompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt)}
              className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedPromptId === prompt.id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{prompt.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{prompt.content}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {prompt.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{formatDistanceToNow(new Date(prompt.updated_at), { addSuffix: true })}</span>
                    {prompt.usage_count > 0 && (
                      <span>Used {prompt.usage_count} time{prompt.usage_count !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopyPrompt(prompt)
                  }}
                  className="ml-4 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
