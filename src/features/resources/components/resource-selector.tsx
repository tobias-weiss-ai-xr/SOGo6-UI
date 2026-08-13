"use client"

/**
 * Resource Selector Component
 * 
 * Allows users to add resources to calendar events
 */

import { useState, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Clock, MapPin, Plus, Users, X } from 'lucide-react'

import type { Resource } from '@/features/resources/types/resources'
import { useBookableResources } from '@/features/resources/hooks/use-resources'

// The event form stores a light resource shape ({id,email,name,
// resource_type}); the selector tolerates the full Resource too.
interface ResourceSelectorValue {
  id: string
  email?: string
  name?: string
  resource_type?: Resource['resource_type']
  location?: string | null
  capacity?: number | null
  is_active?: boolean
}

interface ResourceSelectorProps {
  value: Array<ResourceSelectorValue | Resource>
  onChange: (resources: Array<ResourceSelectorValue | Resource>) => void
  startTime: string
  endTime: string
  className?: string
  disabled?: boolean
  maxResources?: number
}

/**
 * Format resource for display
 */
function getResourceIcon(resource: ResourceSelectorValue | Resource) {
  switch (resource.resource_type) {
    case 'room':
      return <MapPin className="w-4 h-4 mr-2 text-blue-600" />
    case 'equipment':
      return <Users className="w-4 h-4 mr-2 text-orange-600" />
    case 'vehicle':
      return <Clock className="w-4 h-4 mr-2 text-purple-600" />
    default:
      return <Users className="w-4 h-4 mr-2 text-gray-600" />
  }
}

/**
 * Get resource type badge
 */
function getResourceTypeBadge(resource: Resource) {
  const label = resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)
  
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${
      resource.resource_type === 'room' ? 'bg-blue-100 text-blue-800' :
      resource.resource_type === 'equipment' ? 'bg-orange-100 text-orange-800' :
      resource.resource_type === 'vehicle' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {label}
    </span>
  )
}

export default function ResourceSelector({
  value = [],
  onChange,
  startTime,
  endTime,
  className,
  disabled = false,
  maxResources = 10,
}: ResourceSelectorProps) {
  const { resources, isLoading } = useBookableResources()
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleSelect = useCallback((resource: Resource) => {
    // Don't add duplicates
    if (value.some(v => v.id === resource.id)) return
    
    // Check max
    if (value.length >= maxResources) return
    
    onChange([...value, resource])
  }, [value, onChange, maxResources])

  const handleRemove = useCallback((resourceId: string) => {
    onChange(value.filter(v => v.id !== resourceId))
  }, [value, onChange])

  const selectedMap = useMemo(() => {
    return new Map(value.map(r => [r.id, r]))
  }, [value])

  return (
    <div className={className}>
      <div className="space-y-2">
        {/* Selected resources */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map(resource => (
              <Badge
                key={resource.id}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {getResourceIcon(resource)}
                <span className="text-sm">{resource.name}</span>
                <button
                  onClick={() => handleRemove(resource.id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                  disabled={disabled}
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Select button */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start border-dashed"
              disabled={disabled || value.length >= maxResources}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room or Resource
              {value.length >= maxResources && (
                <span className="ml-2 text-xs text-gray-500">Max {maxResources} reached</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search resources..." />
              
              <CommandEmpty>
                {isLoading ? 'Loading resources...' : 'No resources found'}
              </CommandEmpty>
              
              {/* Categorize by type */}
              {(['room', 'equipment', 'vehicle'] as Resource['resource_type'][]).map(type => {
                const typeResources = resources.filter(r => r.resource_type === type)
                if (typeResources.length === 0) return null
                
                return (
                  <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1)}>
                    {typeResources.map(resource => (
                      <CommandItem
                        key={resource.id}
                        className="cursor-pointer data-[selected=true]:bg-blue-50"
                        onSelect={() => {
                          handleSelect(resource)
                          setPopoverOpen(false)
                        }}
                        disabled={selectedMap.has(resource.id)}
                      >
                        <div className="flex items-center w-full">
                          <div className="flex flex-col flex-1">
                            <span className="text-sm font-medium">{resource.name}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              {resource.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {resource.location}
                                </span>
                              )}
                              {resource.capacity && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {resource.capacity}
                                </span>
                              )}
                              {!resource.is_active && (
                                <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Unavailable</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {selectedMap.has(resource.id) ? (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Added</span>
                            ) : (
                              getResourceTypeBadge(resource)
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
              })}
              
              <CommandGroup heading="Help" className="border-t pt-2 mt-2">
                <div className="px-3 py-2 text-xs text-gray-500">
                  All resources will be added as attendees to your event.
                  Resource availability will be checked before saving.
                </div>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
