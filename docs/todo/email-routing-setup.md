# Email Routing Setup — contact@nhandinhbongdavn.com

## Status: Pending

## Goal
Receive emails at `contact@nhandinhbongdavn.com` (used in sponsored content "Liên hệ" link) and forward them to your personal Gmail.

## Method: ImprovMX (free, no nameserver change)

### Step 1: Create ImprovMX account
1. Go to **improvmx.com** → Sign up (free)
2. Add domain: `nhandinhbongdavn.com`
3. Add alias: `contact` → forward to your personal Gmail

### Step 2: Add DNS records in Google Domains / Squarespace

Current DNS: nameservers are `ns-cloud-c*.googledomains.com` (Google Domains / Squarespace).

**Add 2 MX records:**

| Type | Host | Value            | Priority |
|------|------|------------------|----------|
| MX   | @    | mx1.improvmx.com | 10       |
| MX   | @    | mx2.improvmx.com | 20       |

**Update existing TXT record** — change `v=spf1 -all` to:

| Type | Host | Value                                    |
|------|------|------------------------------------------|
| TXT  | @    | v=spf1 include:spf.improvmx.com -all     |

### Step 3: Wait & verify
- DNS propagation: 5-30 minutes
- ImprovMX dashboard will show green checkmarks when detected

### Step 4: Test
Send email from another account to `contact@nhandinhbongdavn.com` → should arrive in Gmail.

### Step 5: Set env var in Vercel
```
NEXT_PUBLIC_CONTACT_EMAIL=contact@nhandinhbongdavn.com
```

## Current DNS snapshot (2026-04-02)
- Nameservers: `ns-cloud-c{1-4}.googledomains.com`
- A record: `216.198.79.1` (Vercel)
- CNAME www: `cname.vercel-dns.com`
- MX: none
- TXT: `v=spf1 -all`

## Notes
- Free plan: 1 domain, unlimited aliases
- No nameserver change needed — zero downtime risk
- Can add more aliases later (e.g., `support@`, `ads@`)
