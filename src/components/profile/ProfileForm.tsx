'use client'

import { useState } from 'react'
import { supabase }
from "@/lib/supabase/client";

type Profile = {
  username: string;
  bio: string;
};

interface ProfileFormProps {
  profile: Profile | null;
  onSuccess: () => void;
}

export default function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      
      alert('Profile updated successfully!')
      onSuccess()

    } catch (error) {

  const message =
    error instanceof Error
      ? error.message
      : "Erro desconhecido";

  alert("Error: " + message);

} finally {

  setLoading(false);

}

};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          required
          pattern="[a-zA-Z0-9_]+"
          title="Only letters, numbers and underscores"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          rows={3}
          maxLength={200}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Tell people about yourself and your links..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  )
}
