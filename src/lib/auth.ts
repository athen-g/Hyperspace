import { supabase } from './supabase'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getCurrentMember() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('core_members')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return data
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
