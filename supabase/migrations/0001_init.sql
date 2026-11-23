-- Phase 1: core multi-tenant schema (skeleton).
-- Money columns use NUMERIC(14,2); app uses integer minor units on the client
-- and NUMERIC here. All business tables carry tenant_id with RLS (to be added).

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_form text,
  share_capital numeric(14,2),
  ice text,
  if_number text,
  rc text,
  rc_court text,
  patente text,
  cnss_number text,
  address text,
  bank_rib text,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  role text not null check (role in ('owner','admin','accountant','sales','hr','warehouse','viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- TODO: RLS policies, remaining tables, audit_log append-only trigger,
-- numbering sequences, stock movements, etc. See ROADMAP.md.
