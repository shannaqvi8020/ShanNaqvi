'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        await createSeedData(data.user.id)
        toast.success('Account created successfully!')
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const createSeedData = async (userId: string) => {
    try {
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .insert([
          { user_id: userId, name: 'Marketing', sort_order: 0 },
          { user_id: userId, name: 'Sales', sort_order: 1 },
          { user_id: userId, name: 'Customer Support', sort_order: 2 },
        ])
        .select()

      if (foldersError) throw foldersError
      
      const folders = (foldersData || []) as Array<{ id: string; name: string }>
      const marketingFolder = folders?.find((f) => f.name === 'Marketing')
      const salesFolder = folders?.find((f) => f.name === 'Sales')
      const supportFolder = folders?.find((f) => f.name === 'Customer Support')

      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .insert([
          { user_id: userId, name: 'content' },
          { user_id: userId, name: 'blog' },
          { user_id: userId, name: 'email' },
          { user_id: userId, name: 'outreach' },
          { user_id: userId, name: 'support' },
          { user_id: userId, name: 'response' },
        ])
        .select()

      if (tagsError) throw tagsError

      const tags = (tagsData || []) as Array<{ id: string; name: string }>
      const contentTag = tags?.find((t) => t.name === 'content')
      const blogTag = tags?.find((t) => t.name === 'blog')
      const emailTag = tags?.find((t) => t.name === 'email')
      const outreachTag = tags?.find((t) => t.name === 'outreach')
      const supportTag = tags?.find((t) => t.name === 'support')
      const responseTag = tags?.find((t) => t.name === 'response')

      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .insert([
          {
            user_id: userId,
            folder_id: marketingFolder?.id,
            title: 'Blog Post Outline',
            content: 'Create a detailed outline for a blog post about {{topic}}. Include an engaging introduction, 5 main sections with subpoints, and a conclusion with a call to action.',
            platform: 'ChatGPT',
          },
          {
            user_id: userId,
            folder_id: salesFolder?.id,
            title: 'Cold Email Sequence',
            content: 'Write a 3-email cold outreach sequence for {{company}} targeting {{audience}}. Email 1 should introduce the problem, Email 2 should present the solution, Email 3 should create urgency.',
            platform: 'ChatGPT',
          },
          {
            user_id: userId,
            folder_id: supportFolder?.id,
            title: 'Customer Complaint Response',
            content: 'You are a customer support agent for {{company}}. Write a professional and empathetic response to a customer who is upset about {{issue}}. Acknowledge their frustration, apologize, and offer a concrete solution.',
            platform: 'Claude',
          },
        ])
        .select()

      if (promptsError) throw promptsError

      const prompts = (promptsData || []) as Array<{ id: string; title: string }>
      const blogPrompt = prompts?.find((p) => p.title === 'Blog Post Outline')
      const emailPrompt = prompts?.find((p) => p.title === 'Cold Email Sequence')
      const supportPrompt = prompts?.find((p) => p.title === 'Customer Complaint Response')

      await supabase.from('prompt_tags').insert([
        { prompt_id: blogPrompt?.id, tag_id: contentTag?.id },
        { prompt_id: blogPrompt?.id, tag_id: blogTag?.id },
        { prompt_id: emailPrompt?.id, tag_id: emailTag?.id },
        { prompt_id: emailPrompt?.id, tag_id: outreachTag?.id },
        { prompt_id: supportPrompt?.id, tag_id: supportTag?.id },
        { prompt_id: supportPrompt?.id, tag_id: responseTag?.id },
      ])
    } catch {
      console.error('Error creating seed data')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-primary-600">
            PromptVault
          </h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
