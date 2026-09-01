-- =============================================================
-- TenderAI — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- ── COMPANIES ──────────────────────────────────────────────
create table public.companies (
  id                    uuid primary key references auth.users(id) on delete cascade,
  name                  text not null,
  gstin                 text,
  pan                   text,
  registration_type     text default 'Private Limited',
  sectors               text[] default '{}',
  certifications        text[] default '{}',
  annual_turnover_lakhs integer default 0,
  years_experience      integer default 0,
  contact_email         text,
  contact_phone         text,
  website               text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table public.companies enable row level security;

create policy "Companies: user owns their row"
  on public.companies for all
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ── TENDERS ────────────────────────────────────────────────
create table public.tenders (
  id                  text primary key,
  title               text not null,
  organization        text not null,
  category            text,
  source_portal       text,
  source_url          text,
  location            text,
  estimated_value     text,
  emd                 text,
  published_at        date,
  closing_at          date,
  status              text default 'Open',
  description         text,
  eligibility         jsonb default '[]',
  documents_required  jsonb default '[]',
  ai_dossier          text,
  ai_parsed_at        timestamptz,
  created_at          timestamptz default now()
);

alter table public.tenders enable row level security;

-- Anyone logged in can read tenders
create policy "Tenders: authenticated read"
  on public.tenders for select
  using (auth.role() = 'authenticated');


-- ── APPLICATIONS ───────────────────────────────────────────
create table public.applications (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  tender_id     text not null references public.tenders(id) on delete cascade,
  status        text default 'draft',
  form_data     jsonb default '{}',
  checked_docs  jsonb default '{}',
  submitted_at  timestamptz,
  created_at    timestamptz default now(),
  unique (company_id, tender_id)
);

alter table public.applications enable row level security;

create policy "Applications: user owns their rows"
  on public.applications for all
  using (auth.uid() = company_id)
  with check (auth.uid() = company_id);


-- ── ELIGIBILITY REPORTS ────────────────────────────────────
create table public.eligibility_reports (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  tender_id         text not null references public.tenders(id) on delete cascade,
  score             integer default 0,
  verdict           text default 'PARTIAL',
  matched           jsonb default '[]',
  missing_criteria  jsonb default '[]',
  missing_docs      jsonb default '[]',
  reasoning         text,
  generated_at      timestamptz default now(),
  unique (company_id, tender_id)
);

alter table public.eligibility_reports enable row level security;

create policy "Eligibility: user owns their rows"
  on public.eligibility_reports for all
  using (auth.uid() = company_id)
  with check (auth.uid() = company_id);


-- ── UPDATED_AT TRIGGER ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();


-- =============================================================
-- SEED DATA — 5 realistic tenders
-- =============================================================
insert into public.tenders
  (id, title, organization, category, source_portal, location,
   estimated_value, emd, published_at, closing_at, status,
   description, eligibility, documents_required)
values
(
  'GEM/2026/B/9481203',
  'Supply & Installation of Solar Streetlights — Phase II',
  'Bhubaneswar Municipal Corporation',
  'Infrastructure & Energy',
  'GeM',
  'Bhubaneswar, Odisha',
  '₹1.85 Cr', '₹92,500',
  '2026-08-02', '2026-09-05', 'Open',
  'Procurement, supply, and on-site installation of 600 solar-powered LED streetlights across Zones 4–7, including a 5-year maintenance contract.',
  '["Class-I/II MSME or Startup India registered vendor","Minimum 3 years in solar infrastructure supply","Average annual turnover ≥ ₹50 lakh (last 3 FY)"]',
  '["GST Registration Certificate","PAN Card","EMD / Bid Security Declaration","Technical Compliance Sheet","Past Performance Certificates"]'
),
(
  'CPPP/OD/RLY/2026/00457',
  'Annual Maintenance Contract — Signal & Telecom Equipment',
  'South Eastern Railway',
  'Railways & Transport',
  'CPPP eProcurement',
  'Kolkata, West Bengal',
  '₹3.2 Cr', '₹1,60,000',
  '2026-07-28', '2026-09-15', 'Open',
  'Comprehensive AMC covering preventive and breakdown maintenance of signalling and telecom systems across 14 stations on the Kolkata division.',
  '["Empanelled railway signalling contractor (Class A/B)","Valid safety certification (RDSO approved)","No blacklisting in last 5 years"]',
  '["RDSO Approval Letter","GST Registration Certificate","Experience Certificates (last 3 AMC contracts)","Bank Solvency Certificate"]'
),
(
  'NIT/AIIMS/2026/EQ/331',
  'Procurement of ICU Ventilators and Monitoring Systems',
  'AIIMS Bhubaneswar',
  'Healthcare Equipment',
  'Institute e-Tender Portal',
  'Bhubaneswar, Odisha',
  '₹4.6 Cr', '₹2,30,000',
  '2026-08-10', '2026-09-20', 'Open',
  'Supply of 40 ICU ventilators, 60 multi-parameter monitors, and installation with a 3-year comprehensive warranty and staff training.',
  '["CDSCO / FDA approved manufacturer or authorised dealer","ISO 13485 certified","Minimum 2 similar supply orders to govt hospitals"]',
  '["Manufacturing / Import License","ISO 13485 Certificate","Product Compliance Datasheet","Authorization Letter (if dealer)","EMD Instrument"]'
),
(
  'GEM/2026/S/7720194',
  'Campus-wide Wi-Fi Network Upgrade',
  'KIIT Deemed University',
  'IT & Networking',
  'GeM',
  'Bhubaneswar, Odisha',
  '₹78 lakh', '₹39,000',
  '2026-08-15', '2026-09-25', 'Open',
  'Design, supply, and deployment of a campus-wide Wi-Fi 6 network covering 12 academic blocks and 6 hostels, with a 2-year AMC.',
  '["OEM authorised system integrator","CCTV / structured cabling experience preferred","Turnover ≥ ₹1 Cr (last FY)"]',
  '["OEM Authorization Certificate","GST Registration Certificate","Network Design Proposal","EMD Instrument"]'
),
(
  'PWD/OD/2026/ROAD/1129',
  'Widening & Resurfacing of NH-16 Service Road',
  'Odisha Public Works Department',
  'Civil & Roadworks',
  'CPPP eProcurement',
  'Khordha, Odisha',
  '₹6.4 Cr', '₹3,20,000',
  '2026-06-20', '2026-09-30', 'Open',
  'Widening of a 4.2 km service road stretch to two lanes with bituminous resurfacing and drainage work.',
  '["Class-A registered civil contractor with PWD","Minimum 5 completed road projects ≥ ₹2 Cr each"]',
  '["PWD Contractor Registration","Machinery Ownership Proof","Completion Certificates","EMD Instrument"]'
);
