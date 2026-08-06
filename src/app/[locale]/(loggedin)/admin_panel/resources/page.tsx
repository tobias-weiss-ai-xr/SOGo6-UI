"use client"

/**
 * Admin Resource Management Page
 * 
 * Allows administrators to create, edit, delete, and manage resources
 */

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import type { Resource, ResourceType, BookingPolicy } from '@/features/resources/types/resources'

// Helper functions
function formatResourceType(type: ResourceType): string {
  const types: Record<ResourceType, string> = { room: 'Room', equipment: 'Equipment', vehicle: 'Vehicle', other: 'Other' }
  return types[type] || type
}

// Mock admin API - replace with real API calls
const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Conference Room A',
    description: 'Large conference room with projector and whiteboard',
    email: 'room-a@company.org',
    resource_type: 'room',
    capacity: 20,
    location: 'Building A, Floor 1',
    features: ['projector', 'whiteboard', 'video_conferencing'],
    is_active: true,
    booking_policy: 'open',
    auto_accept: true,
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-15T14:30:00Z',
    allowed_groups: [],
    is_favorite: false,
  },
  {
    id: '2',
    name: 'Laptop Cart',
    description: '10 laptops for training sessions',
    email: 'laptops@company.org',
    resource_type: 'equipment',
    capacity: null,
    location: 'IT Department',
    features: ['laptops', 'chargers'],
    is_active: true,
    booking_policy: 'moderated',
    auto_accept: false,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-20T11:20:00Z',
    allowed_groups: ['training-team'],
    is_favorite: false,
  },
  {
    id: '3',
    name: 'Company Van',
    description: 'Technician transportation vehicle',
    email: 'van@company.org',
    resource_type: 'vehicle',
    capacity: 8,
    location: 'Parking Lot C',
    features: ['AC', 'GPS'],
    is_active: false,
    booking_policy: 'restricted',
    auto_accept: false,
    created_at: '2025-03-01T10:00:00Z',
    updated_at: '2025-03-10T09:15:00Z',
    allowed_groups: ['technicians', 'management'],
    is_favorite: false,
  },
]

export default function AdminResourceManagementPage() {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>(mockResources)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [filter, setFilter] = useState<{ search: string; type: ResourceType | 'all' }>({
    search: '',
    type: 'all',
  })
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<Partial<Resource>>({
    name: '',
    description: '',
    email: '',
    resource_type: 'room',
    capacity: null,
    location: '',
    features: [],
    is_active: true,
    booking_policy: 'open',
    auto_accept: true,
    allowed_groups: [],
  })

  // Load resources (mock for now)
  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/admin/v1/resources')
        // const data = await response.json()
        // setResources(data.resources)
        setResources(mockResources)
      } catch (err) {
        setError('Failed to load resources')
      } finally {
        setIsLoading(false)
      }
    }
    loadResources()
  }, [])

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = filter.search === '' || 
        resource.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        (resource.description || '').toLowerCase().includes(filter.search.toLowerCase()) ||
        (resource.location || '').toLowerCase().includes(filter.search.toLowerCase())
      const matchesType = filter.type === 'all' || resource.resource_type === filter.type
      return matchesSearch && matchesType
    })
  }, [resources, filter])

  // Form handlers
  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      email: '',
      resource_type: 'room',
      capacity: null,
      location: '',
      features: [],
      is_active: true,
      booking_policy: 'open',
      auto_accept: true,
      allowed_groups: [],
    })
    setShowCreateModal(true)
  }

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource)
    setFormData({ ...resource, features: resource.features || [], allowed_groups: resource.allowed_groups || [] })
    setShowEditModal(true)
  }

  const handleDelete = (resource: Resource) => {
    setSelectedResource(resource)
    setShowDeleteModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
    setFormData({})
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedResource(null)
    setFormData({})
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedResource(null)
  }

  const handleFormChange = (field: keyof Resource, value: string | number | boolean | string[] | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit to API
    console.log('Form submitted:', formData)
    if (showCreateModal) {
      // Create new resource
      const newResource: Resource = {
        ...formData as Resource,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_favorite: false,
      }
      setResources(prev => [...prev, newResource])
      handleCloseCreateModal()
    } else if (showEditModal && selectedResource) {
      // Update existing resource
      setResources(prev => prev.map(r => r.id === selectedResource.id ? { ...r, ...formData as Resource, updated_at: new Date().toISOString() } : r))
      handleCloseEditModal()
    }
  }

  const handleDeleteConfirm = () => {
    if (!selectedResource) return
    setResources(prev => prev.filter(r => r.id !== selectedResource.id))
    handleCloseDeleteModal()
  }

  const handleAddFeature = () => {
    const features = formData.features || []
    setFormData(prev => ({ ...prev, features: [...features, ''] }))
  }

  const handleRemoveFeature = (index: number) => {
    const features = formData.features || []
    const newFeatures = [...features]
    newFeatures.splice(index, 1)
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const handleUpdateFeature = (index: number, value: string) => {
    const features = formData.features || []
    const newFeatures = [...features]
    newFeatures[index] = value
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const handleAddAllowedGroup = () => {
    const allowedGroups = formData.allowed_groups || []
    setFormData(prev => ({ ...prev, allowed_groups: [...allowedGroups, ''] }))
  }

  const handleRemoveAllowedGroup = (index: number) => {
    const allowedGroups = formData.allowed_groups || []
    const newGroups = [...allowedGroups]
    newGroups.splice(index, 1)
    setFormData(prev => ({ ...prev, allowed_groups: newGroups }))
  }

  const handleUpdateAllowedGroup = (index: number, value: string) => {
    const allowedGroups = formData.allowed_groups || []
    const newGroups = [...allowedGroups]
    newGroups[index] = value
    setFormData(prev => ({ ...prev, allowed_groups: newGroups }))
  }

  // Render helpers
  const renderResourceRow = (resource: Resource) => (
    <tr key={resource.id} className="hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="font-medium text-gray-900">{resource.name}</div>
        <div className="text-sm text-gray-500 truncate max-w-xs">{resource.description || 'No description'}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${
          resource.resource_type === 'room' ? 'bg-blue-100 text-blue-800' :
          resource.resource_type === 'equipment' ? 'bg-orange-100 text-orange-800' :
          resource.resource_type === 'vehicle' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {formatResourceType(resource.resource_type)}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{resource.location || 'N/A'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{resource.capacity || 'N/A'}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${
          resource.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {resource.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${
          resource.booking_policy === 'open' ? 'bg-green-100 text-green-800' :
          resource.booking_policy === 'moderated' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
        }`}>
          {resource.booking_policy}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => router.push(`/resources/${resource.id}`)}
            className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100"
            title="View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleEdit(resource)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(resource)}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )

  // Create/Edit Modal
  const ResourceFormModal = ({ title, submitText }: { title: string; submitText: string }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={showCreateModal ? handleCloseCreateModal : handleCloseEditModal} />
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{title}</h3>
            </div>
          </div>
          <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text" id="name" required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                value={formData.name || ''} onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description" rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.description || ''} onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" id="email"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.email || ''} onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="resource@company.org"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="resource_type" className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  id="resource_type" required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={(formData.resource_type as ResourceType) || 'room'}
                  onChange={(e) => handleFormChange('resource_type', e.target.value as ResourceType)}
                >
                  <option value="room">Room</option>
                  <option value="equipment">Equipment</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number" id="capacity" min="1"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.capacity || ''} onChange={(e) => handleFormChange('capacity', e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text" id="location"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.location || ''} onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="Building A, Floor 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
              <div className="space-y-2">
                {(formData.features || []).map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text" placeholder="e.g. projector, whiteboard"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={feature} onChange={(e) => handleUpdateFeature(index, e.target.value)}
                    />
                    <button
                      type="button" onClick={() => handleRemoveFeature(index)}
                      className="px-2 py-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button" onClick={handleAddFeature}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Feature
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking_policy" className="block text-sm font-medium text-gray-700 mb-1">Booking Policy *</label>
                <select
                  id="booking_policy" required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={(formData.booking_policy as BookingPolicy) || 'open'}
                  onChange={(e) => handleFormChange('booking_policy', e.target.value as BookingPolicy)}
                >
                  <option value="open">Open (anyone can book)</option>
                  <option value="moderated">Moderated (requires approval)</option>
                  <option value="restricted">Restricted (specific groups only)</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" id="auto_accept"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.auto_accept ?? true} onChange={(e) => handleFormChange('auto_accept', e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-accept bookings</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Groups</label>
              <p className="text-xs text-gray-500 mb-2">Leave empty for all users. Only applies to "restricted" policy.</p>
              <div className="space-y-2">
                {(formData.allowed_groups || []).map((group, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text" placeholder="LDAP group DN"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={group} onChange={(e) => handleUpdateAllowedGroup(index, e.target.value)}
                    />
                    <button
                      type="button" onClick={() => handleRemoveAllowedGroup(index)}
                      className="px-2 py-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button" onClick={handleAddAllowedGroup}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Group
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" id="is_active"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={formData.is_active ?? true} onChange={(e) => handleFormChange('is_active', e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="mt-5 sm:mt-6 flex justify-end gap-3">
              <button
                type="button" onClick={showCreateModal ? handleCloseCreateModal : handleCloseEditModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                {submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  // Delete Confirmation Modal
  const DeleteModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseDeleteModal} />
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Delete Resource
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <span className="font-medium text-gray-900">{selectedResource?.name}</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 flex justify-end gap-3">
            <button
              type="button" onClick={handleCloseDeleteModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button" onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
            <p className="text-gray-500 mt-1">Manage meeting rooms, equipment, and vehicles</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Resource
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text" id="search" placeholder="Resource name..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filter.search} onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                id="type"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filter.type} onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as ResourceType | 'all' }))}
              >
                <option value="all">All Types</option>
                <option value="room">Rooms</option>
                <option value="equipment">Equipment</option>
                <option value="vehicle">Vehicles</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span>Loading resources...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center text-red-600">
            {error}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>No resources found</p>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Create Resource
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Policy</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResources.map(renderResourceRow)}
              </tbody>
            </table>
            <div className="p-4 text-sm text-gray-500">
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && <ResourceFormModal title="Create Resource" submitText="Create" />}
      {showEditModal && <ResourceFormModal title="Edit Resource" submitText="Save Changes" />}
      {showDeleteModal && <DeleteModal />}
    </div>
  )
}
