# Roadmap — APEX-ERP refactor

## Phase status
- [x] Phase 0 — Cleanup (delete keygen.html, stray files, published keys; folder structure; ESLint/Prettier/Vitest/CI; .env.example; money helper + tests; validators)
- [~] Phase 1 — Database + multi-tenancy (skeleton only: tenants/profiles migration, RLS TODO)
- [ ] Phase 2 — Auth + user management
- [ ] Phase 3 — Licence system (signed tokens, activation, heartbeat, gating)
- [ ] Phase 4 — Invoicing compliance (Morocco)
- [ ] Phase 5 — Trading (négoce) workflow
- [ ] Phase 6 — Accounting (CGNC)
- [ ] Phase 7 — Payroll (HR)
- [ ] Phase 8 — Data protection + security
- [ ] Phase 9 — E-invoicing readiness
- [ ] Phase 10 — i18n + UX
- [ ] Phase 11 — Testing + deploy

## How to run
- `npm install --legacy-peer-deps`
- `npm run typecheck` (must pass)
- `npm test` (Vitest)
- `npm run build`
- `npm run dev` (Vite on :3000)

## Notes
- Supabase not yet wired; backendSimulator still used as interim repository. Replace per Phase 1.
- Legal/tax/payroll values are configurable (LEGAL_TODO.md).
