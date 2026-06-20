'use client'

import { useState } from 'react'
import { supabase }
from "@/lib/supabase/client";

interface LinkFormProps {
  onSuccess: () => void
  editLink?: any
}

export default function LinkForm({ onSuccess, editLink }: LinkFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: editLink?.title || '',
    affiliate_url: editLink?.affiliate_url || '',
    slug: editLink?.slug || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (editLink) {
        // Update existing link
        const { error } = await supabase
          .from('links')
          .update(formData)
          .eq('id', editLink.id)
        if (error) throw error
      } else {
        // Create new link
        const { error } = await supabase
          .from('links')
          .insert([{ ...formData, user_id: user.id }])
        if (error) throw error
      }

      onSuccess()
      if (!editLink) {
        setFormData({ title: '', affiliate_url: '', slug: '' })
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Amazon Deal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Affiliate URL</label>
        <input
          type="url"
          required
          value={formData.affiliate_url}
          onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://amazon.com/affiliate-link"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="amazon-deal"
        />
        <p className="text-xs text-gray-500 mt-1">Will be: {typeof window !== 'undefined' && `${window.location.origin}/go/${formData.slug || 'slug'}`}</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : editLink ? 'Update Link' : 'Create Link'}
      </button>
    </form>
  )
}
