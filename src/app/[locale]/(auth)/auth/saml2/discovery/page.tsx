'use client'

/**
 * SAML2 Discovery Service (WAYF — Where Are You From)
 *
 * Shows a searchable list of available Identity Providers (IdPs) from the
 * federation metadata or admin-configured provider list.  When the user
 * selects an IdP, the page POSTs to /api/user/v1/auth/saml2/discovery and
 * redirects to the IdP's SSO URL.
 */

import { authApi, type Saml2IdpEntry } from '@/lib/api/endpoints/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function Saml2DiscoveryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const relayState = searchParams.get('relay_state') || ''
  const domain = searchParams.get('domain') || ''

  const [idps, setIdps] = useState<Saml2IdpEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    async function loadIdps() {
      try {
        setLoading(true)
        const resp = await authApi.saml2Discovery()
        setIdps(resp.idps)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load IdP list')
      } finally {
        setLoading(false)
      }
    }
    loadIdps()
  }, [])

  const filteredIdps = useCallback(() => {
    if (!search) return idps
    const q = search.toLowerCase()
    return idps.filter(
      (idp) =>
        idp.name.toLowerCase().includes(q) ||
        idp.entity_id.toLowerCase().includes(q)
    )
  }, [idps, search])

  const handleSelect = async (entityId: string) => {
    try {
      setSelecting(entityId)
      const resp = await authApi.saml2SelectIdp({
        entity_id: entityId,
        relay_state: relayState || domain,
        domain,
      })
      // Redirect to the IdP SSO URL
      window.location.href = resp.redirect_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate SSO')
      setSelecting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading Identity Providers…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-xl font-semibold text-red-600">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const list = filteredIdps()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Select your institution
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Choose your Identity Provider to continue with single sign-on.
        </p>

        <input
          type="text"
          placeholder="Search institutions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          aria-label="Search institutions"
        />

        {list.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            {search
              ? 'No institutions match your search.'
              : 'No Identity Providers configured.'}
          </p>
        ) : (
          <ul className="max-h-[60vh] space-y-2 overflow-y-auto" role="listbox">
            {list.map((idp) => (
              <li
                key={idp.entity_id}
                role="option"
                aria-selected={selecting === idp.entity_id}
              >
                <button
                  onClick={() => handleSelect(idp.entity_id)}
                  disabled={selecting !== null}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
                >
                  {idp.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={idp.logo_url}
                      alt=""
                      className="h-8 w-8 flex-shrink-0 rounded"
                    />
                  ) : (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-600">
                      {idp.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-gray-900">{idp.name}</div>
                    <div className="truncate text-xs text-gray-400">
                      {idp.entity_id}
                    </div>
                  </div>
                  {selecting === idp.entity_id && (
                    <span className="text-sm text-blue-600">Connecting…</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          {list.length} Identity Provider{list.length !== 1 ? 's' : ''}{' '}
          available
        </p>
      </div>
    </div>
  )
}
