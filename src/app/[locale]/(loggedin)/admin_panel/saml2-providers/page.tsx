'use client'

/**
 * SAML2 Provider Management (Admin)
 *
 * CRUD UI for SAML2 IdP trust relationships.
 */

import {
  authApi,
  type Saml2Provider,
  type Saml2ProviderCreate,
} from '@/lib/api/endpoints/auth'
import { useCallback, useEffect, useState } from 'react'

const emptyForm: Saml2ProviderCreate = {
  id: '',
  name: '',
  entity_id: '',
  sso_url: '',
  sso_binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
  metadata_url: '',
  nameid_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  is_active: true,
}

export default function Saml2ProvidersAdminPage() {
  const [providers, setProviders] = useState<Saml2Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Saml2Provider | null>(null)
  const [form, setForm] = useState<Saml2ProviderCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState<string | null>(null)

  const loadProviders = useCallback(async () => {
    try {
      setLoading(true)
      const resp = await authApi.listSaml2Providers()
      setProviders(resp.providers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProviders()
  }, [loadProviders])

  const handleCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleEdit = (provider: Saml2Provider) => {
    setEditing(provider)
    setForm({
      id: provider.id,
      name: provider.name,
      entity_id: provider.entity_id,
      sso_url: provider.sso_url,
      sso_binding:
        provider.sso_binding ||
        'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      sls_url: provider.sls_url || '',
      certificate: provider.certificate || '',
      metadata_url: provider.metadata_url || '',
      nameid_format:
        provider.nameid_format ||
        'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      is_active: provider.is_active,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editing) {
        await authApi.updateSaml2Provider(editing.id, form)
      } else {
        await authApi.createSaml2Provider(form)
      }
      setShowForm(false)
      await loadProviders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save provider')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this SAML2 provider?')) return
    try {
      await authApi.deleteSaml2Provider(providerId)
      await loadProviders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider')
    }
  }

  const handleRefresh = async (providerId: string) => {
    try {
      setRefreshing(providerId)
      await authApi.refreshSaml2ProviderMetadata(providerId)
      await loadProviders()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to refresh metadata'
      )
    } finally {
      setRefreshing(null)
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Loading SAML2 providers…</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SAML2 Providers</h1>
          <p className="text-sm text-gray-500">
            Manage Identity Provider trust relationships
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Provider
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editing ? 'Edit Provider' : 'New Provider'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="ID (slug)" required>
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={!!editing}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </FormField>
            <FormField label="Display Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </FormField>
            <FormField label="Entity ID" required>
              <input
                type="text"
                value={form.entity_id}
                onChange={(e) =>
                  setForm({ ...form, entity_id: e.target.value })
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </FormField>
            <FormField label="SSO URL" required>
              <input
                type="url"
                value={form.sso_url}
                onChange={(e) => setForm({ ...form, sso_url: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </FormField>
            <FormField label="Metadata URL (auto-fetch)">
              <input
                type="url"
                value={form.metadata_url}
                onChange={(e) =>
                  setForm({ ...form, metadata_url: e.target.value })
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://idp.example.org/idp/shibboleth/metadata"
              />
            </FormField>
            <FormField label="NameID Format">
              <input
                type="text"
                value={form.nameid_format}
                onChange={(e) =>
                  setForm({ ...form, nameid_format: e.target.value })
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </FormField>
            <FormField label="Certificate (PEM)" full>
              <textarea
                value={form.certificate}
                onChange={(e) =>
                  setForm({ ...form, certificate: e.target.value })
                }
                rows={4}
                className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs"
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              />
            </FormField>
            <FormField label="Active">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
                <span className="text-sm text-gray-600">
                  Enable this provider
                </span>
              </label>
            </FormField>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={
                saving ||
                !form.id ||
                !form.name ||
                !form.entity_id ||
                !form.sso_url
              }
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {providers.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No SAML2 providers configured.</p>
          <button
            onClick={handleCreate}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add your first provider
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Entity ID</th>
                <th className="px-4 py-3">SSO URL</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {providers.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.entity_id}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                    {p.sso_url}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        p.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRefresh(p.id)}
                        disabled={refreshing === p.id || !p.metadata_url}
                        className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                        title={
                          p.metadata_url
                            ? 'Refresh metadata'
                            : 'No metadata URL configured'
                        }
                      >
                        {refreshing === p.id ? 'Refreshing…' : 'Refresh'}
                      </button>
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FormField({
  label,
  required,
  full,
  children,
}: {
  label: string
  required?: boolean
  full?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  )
}
