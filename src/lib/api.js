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

export async function createTender(tenderData) {
  // Always persist to local cache so custom tenders are 100% reliable in demo mode
  const localUploaded = JSON.parse(localStorage.getItem('dossier_uploaded_tenders') || '[]')
  const filtered = localUploaded.filter((t) => t.id !== tenderData.id)
  localStorage.setItem('dossier_uploaded_tenders', JSON.stringify([tenderData, ...filtered]))

  if (supabase) {
    try {
      // Filter payload strictly to columns matching public.tenders schema
      const dbPayload = {
        id: tenderData.id,
        title: tenderData.title,
        organization: tenderData.organization,
        category: tenderData.category,
        location: tenderData.location,
        estimated_value: tenderData.estimated_value,
        emd: tenderData.emd,
        published_at: tenderData.published_at || new Date().toISOString().split('T')[0],
        closing_at: tenderData.closing_at,
        status: tenderData.status || 'Open',
        source_portal: tenderData.source_portal || 'Custom Upload (PDF)',
        description: tenderData.description,
        eligibility: tenderData.eligibility || [],
        documents_required: tenderData.documents_required || [],
        ai_dossier: tenderData.ai_dossier || tenderData.markdown_report || null,
        created_at: tenderData.created_at || new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('tenders')
        .upsert([dbPayload], { onConflict: 'id' })
        .select()
        .single()
      if (!error && data) return { ...tenderData, ...data }
      if (error) console.warn('Supabase tender upsert notice:', error.message)
    } catch (err) {
      console.warn('Supabase tender insert failed, persisting via local cache:', err.message)
    }
  }
  return tenderData
}

export async function getTenders({ query = '', category = 'All', status = 'All' } = {}) {
  let dbTenders = []
  if (supabase) {
    let q = supabase.from('tenders').select('*').order('closing_at', { ascending: true })
    if (category !== 'All') q = q.eq('category', category)
    if (status !== 'All') q = q.eq('status', status)
    if (query) {
      q = q.or(
        `title.ilike.%${query}%,organization.ilike.%${query}%,id.ilike.%${query}%`
      )
    }
    const { data, error } = await q.catch(() => ({ data: [] }))
    if (!error && data) dbTenders = data
  }

  // Merge with any custom uploaded tenders
  const localUploaded = JSON.parse(localStorage.getItem('dossier_uploaded_tenders') || '[]')
  const map = new Map()
  dbTenders.forEach((t) => map.set(t.id, t))
  localUploaded.forEach((t) => map.set(t.id, t))
  let combined = Array.from(map.values())

  if (category !== 'All') combined = combined.filter((t) => t.category === category)
  if (status !== 'All') combined = combined.filter((t) => t.status === status)
  if (query) {
    const qLower = query.toLowerCase()
    combined = combined.filter(
      (t) =>
        t.title?.toLowerCase().includes(qLower) ||
        t.organization?.toLowerCase().includes(qLower) ||
        t.id?.toLowerCase().includes(qLower)
    )
  }
  return combined
}

export async function getTenderById(id) {
  if (supabase) {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', id)
      .single()
    if (!error && data) return data
  }
  // Check local uploaded tenders
  const localUploaded = JSON.parse(localStorage.getItem('dossier_uploaded_tenders') || '[]')
  const localMatch = localUploaded.find((t) => t.id === id)
  if (localMatch) return localMatch

  throw new Error('Tender not found')
}

export async function saveTenderDossier(tenderId, dossierText) {
  // Update local uploaded cache if applicable
  const localUploaded = JSON.parse(localStorage.getItem('dossier_uploaded_tenders') || '[]')
  const updatedLocal = localUploaded.map((t) =>
    t.id === tenderId ? { ...t, ai_dossier: dossierText, ai_parsed_at: new Date().toISOString() } : t
  )
  localStorage.setItem('dossier_uploaded_tenders', JSON.stringify(updatedLocal))

  if (supabase) {
    const { error } = await supabase
      .from('tenders')
      .update({ ai_dossier: dossierText, ai_parsed_at: new Date().toISOString() })
      .eq('id', tenderId)
    if (error) console.warn('Failed to cache dossier in Supabase:', error.message)
  }
}

export async function getTenderCategories() {
  const categoriesSet = new Set()
  if (supabase) {
    const { data } = await supabase.from('tenders').select('category').catch(() => ({ data: [] }))
    if (data) data.forEach((r) => r.category && categoriesSet.add(r.category))
  }
  const localUploaded = JSON.parse(localStorage.getItem('dossier_uploaded_tenders') || '[]')
  localUploaded.forEach((t) => t.category && categoriesSet.add(t.category))
  return Array.from(categoriesSet)
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
