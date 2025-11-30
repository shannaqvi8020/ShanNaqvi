'use client'

import { useState, useEffect } from 'react'

interface VariableModalProps {
  isOpen: boolean
  variables: string[]
  onSubmit: (values: Record<string, string>) => void
  onClose: () => void
}

export default function VariableModal({
  isOpen,
  variables,
  onSubmit,
  onClose,
}: VariableModalProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      const initialValues: Record<string, string> = {}
      variables.forEach((v) => {
        initialValues[v] = ''
      })
      setValues(initialValues)
    }
  }, [isOpen, variables])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Fill in Variables
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {variables.map((variable) => (
            <div key={variable}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {variable}
              </label>
              <input
                type="text"
                value={values[variable] || ''}
                onChange={(e) =>
                  setValues({ ...values, [variable]: e.target.value })
                }
                placeholder={`Enter ${variable}...`}
                className="input-field"
                autoFocus={variables.indexOf(variable) === 0}
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 btn-primary">
              Copy to Clipboard
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
