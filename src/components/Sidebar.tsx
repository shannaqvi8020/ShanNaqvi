'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import type { Folder, TagWithCount } from '@/types/database'
import { mockCreateFolder, mockUpdateFolder, mockDeleteFolder } from '@/lib/mockData'
import type { User } from '@supabase/supabase-js'

interface SidebarProps {
  user: User | null
  folders: Folder[]
  tags: TagWithCount[]
  selectedFolderId: string | null
  selectedTagId: string | null
  showUnsorted: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectAllPrompts: () => void
  onSelectFolder: (folderId: string | null) => void
  onSelectTag: (tagId: string | null) => void
  onSelectUnsorted: () => void
  onFoldersChange: () => void
}

export default function Sidebar({
  user,
  folders,
  tags,
  selectedFolderId,
  selectedTagId,
  showUnsorted,
  searchQuery,
  onSearchChange,
  onSelectAllPrompts,
  onSelectFolder,
  onSelectTag,
  onSelectUnsorted,
  onFoldersChange,
}: SidebarProps) {
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState('')

  const handleLogout = () => {
    toast.success('Demo logout - refresh to reset')
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      await mockCreateFolder(newFolderName.trim())
      toast.success('Folder created')
      setNewFolderName('')
      setShowNewFolder(false)
      onFoldersChange()
    } catch (error) {
      toast.error('Failed to create folder')
    }
  }

  const handleRenameFolder = async (folderId: string) => {
    if (!editingFolderName.trim()) {
      setEditingFolderId(null)
      return
    }

    try {
      await mockUpdateFolder(folderId, editingFolderName.trim())
      toast.success('Folder renamed')
      setEditingFolderId(null)
      onFoldersChange()
    } catch (error) {
      toast.error('Failed to rename folder')
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder? Prompts in this folder will become unsorted.')) return

    try {
      await mockDeleteFolder(folderId)
      toast.success('Folder deleted')
      if (selectedFolderId === folderId) {
        onSelectAllPrompts()
      }
      onFoldersChange()
    } catch (error) {
      toast.error('Failed to delete folder')
    }
  }

  const isAllPromptsActive = !selectedFolderId && !selectedTagId && !showUnsorted

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">PromptVault</h1>
      </div>

      <div className="p-4">
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field text-sm"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <button
          onClick={onSelectAllPrompts}
          className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 transition-colors ${
            isAllPromptsActive
              ? 'bg-primary-100 text-primary-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          All Prompts
        </button>

        <button
          onClick={onSelectUnsorted}
          className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 transition-colors ${
            showUnsorted
              ? 'bg-primary-100 text-primary-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          Unsorted
        </button>

        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Folders
            </span>
            <button
              onClick={() => setShowNewFolder(true)}
              className="text-gray-400 hover:text-primary-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {showNewFolder && (
            <form onSubmit={handleCreateFolder} className="px-2 mb-2">
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => {
                  if (!newFolderName.trim()) setShowNewFolder(false)
                }}
                autoFocus
                className="input-field text-sm py-1"
              />
            </form>
          )}

          {folders.map((folder) => (
            <div key={folder.id} className="group relative">
              {editingFolderId === folder.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleRenameFolder(folder.id)
                  }}
                  className="px-2 mb-1"
                >
                  <input
                    type="text"
                    value={editingFolderName}
                    onChange={(e) => setEditingFolderName(e.target.value)}
                    onBlur={() => handleRenameFolder(folder.id)}
                    autoFocus
                    className="input-field text-sm py-1"
                  />
                </form>
              ) : (
                <button
                  onClick={() => onSelectFolder(folder.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 transition-colors ${
                    selectedFolderId === folder.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="flex-1 truncate">{folder.name}</span>
                </button>
              )}
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingFolderId(folder.id)
                    setEditingFolderName(folder.name)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFolder(folder.id)
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tags
            </span>
          </div>

          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onSelectTag(tag.id)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center justify-between transition-colors ${
                selectedTagId === tag.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {tag.name}
              </span>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {tag.count}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-700 truncate max-w-[120px]">
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
