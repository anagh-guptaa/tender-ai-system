// Data access layer — all Supabase queries in one place.
// Import these instead of calling supabase directly from components.

import { supabase } from './supabaseClient'

// ── COMPANY PROFILE ───────────────────────────────────────────────────────────

export async function getCompanyProfile(userId) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = row not found
  return data
}

export async function upsertCompanyProfile(profile) {
  const { data, error } = await supabase
    .from('companies')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── TENDERS ───────────────────────────────────────────────────────────────────

export async function getTenders({ query = '', category = 'All', status = 'All' } = {}) {
  let q = supabase.from('tenders').select('*').order('closing_at', { ascending: true })
  if (category !== 'All') q = q.eq('category', category)
  if (status !== 'All') q = q.eq('status', status)
  if (query) {
    q = q.or(
      `title.ilike.%${query}%,organization.ilike.%${query}%,id.ilike.%${query}%`
    )
  }
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function getTenderById(id) {
  const { data, error } = await supabase
    .from('tenders')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function saveTenderDossier(tenderId, dossierText) {
  const { error } = await supabase
    .from('tenders')
    .update({ ai_dossier: dossierText, ai_parsed_at: new Date().toISOString() })
    .eq('id', tenderId)
  if (error) throw error
}

export async function getTenderCategories() {
  const { data, error } = await supabase
    .from('tenders')
    .select('category')
  if (error) throw error
  return [...new Set(data.map((t) => t.category).filter(Boolean))]
}

// ── APPLICATIONS ──────────────────────────────────────────────────────────────

export async function getMyApplications(companyId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, tenders(title, organization, estimated_value, closing_at)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getApplicationForTender(companyId, tenderId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('company_id', companyId)
    .eq('tender_id', tenderId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertApplication(application) {
  const { data, error } = await supabase
    .from('applications')
    .upsert(application, { onConflict: 'company_id,tender_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── ELIGIBILITY REPORTS ───────────────────────────────────────────────────────

export async function getEligibilityReport(companyId, tenderId) {
  const { data, error } = await supabase
    .from('eligibility_reports')
    .select('*')
    .eq('company_id', companyId)
    .eq('tender_id', tenderId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function saveEligibilityReport(report) {
  const { data, error } = await supabase
    .from('eligibility_reports')
    .upsert(report, { onConflict: 'company_id,tender_id' })
    .select()
    .single()
  if (error) throw error
  return data
}
