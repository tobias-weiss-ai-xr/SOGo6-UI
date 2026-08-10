'use client'

/**
 * Team Calendars management page.
 *
 * Uses the real Team Calendars API (spec: team-calendars):
 *  - List / create team calendars
 *  - Manage members (add / update level / remove)
 *  - Send invitations and act on pending ones
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useListTeamCalendarsQuery,
  useCreateTeamCalendarMutation,
  useDeleteTeamCalendarMutation,
  useListTeamMembersQuery,
  useAddTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useInviteToTeamCalendarMutation,
  useListPendingInvitesQuery,
  useAcceptInviteMutation,
  useRejectInviteMutation,
} from '@/features/team-calendars/store/team-calendars-api'
import type { TeamCalendarShareLevel } from '@/features/team-calendars/team-calendars-types'

const SHARE_LEVELS: TeamCalendarShareLevel[] = [
  'view_date_time',
  'view_all',
  'respond',
  'modify_if_org',
  'modify',
]

function formatLevel(level: string): string {
  return level.replace(/_/g, ' ')
}

export default function TeamCalendarsPage() {
  // ── Data ─────────────────────────────────────────────────────────────
  const { data: teamsData, isLoading, isError, refetch } = useListTeamCalendarsQuery()
  const { data: invitesData } = useListPendingInvitesQuery()

  // ── Mutations ────────────────────────────────────────────────────────
  const [createTeam] = useCreateTeamCalendarMutation()
  const [deleteTeam] = useDeleteTeamCalendarMutation()
  const [addMember] = useAddTeamMemberMutation()
  const [updateMember] = useUpdateTeamMemberMutation()
  const [removeMember] = useRemoveTeamMemberMutation()
  const [inviteUser] = useInviteToTeamCalendarMutation()
  const [acceptInvite] = useAcceptInviteMutation()
  const [rejectInvite] = useRejectInviteMutation()

  // ── Local state ──────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#4a9eff')
  const [description, setDescription] = useState('')
  const [activeTeam, setActiveTeam] = useState<string | null>(null)

  // member form
  const [memberUid, setMemberUid] = useState('')
  const [memberLevel, setMemberLevel] = useState<TeamCalendarShareLevel>('view_all')

  const teams = teamsData?.calendars ?? []
  const invites = invitesData?.invites ?? []
  const active = teams.find((t) => t.key === activeTeam)

  // ── Handlers ─────────────────────────────────────────────────────────
  async function handleCreate() {
    if (!name.trim()) return
    await createTeam({
      name: name.trim(),
      color: color || null,
      description: description.trim() || null,
      timezone: 'UTC',
    })
    setName('')
    setDescription('')
    setCreateOpen(false)
  }

  async function handleAddMember() {
    if (!activeTeam || !memberUid.trim()) return
    await addMember({ teamId: activeTeam, body: { user_uid: memberUid.trim(), share_level: memberLevel } })
    setMemberUid('')
    setMemberLevel('view_all')
  }

  async function handleInvite() {
    if (!activeTeam || !memberUid.trim()) return
    await inviteUser({ teamId: activeTeam, body: { user_uid: memberUid.trim(), share_level: memberLevel } })
    setMemberUid('')
    setMemberLevel('view_all')
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Calendars</h1>
          <p className="text-sm text-muted-foreground">
            Shared calendars for teams — create, invite members and manage access.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Team Calendar</Button>
      </div>

      {isError && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load team calendars.{' '}
          <button className="underline" onClick={refetch}>Retry</button>
        </div>
      )}

      {/* Pending invitations */}
      {invites.length > 0 && (
        <div className="mb-6 rounded-md border p-4">
          <h2 className="mb-3 text-lg font-semibold">Pending invitations</h2>
          <ul className="space-y-2">
            {invites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between rounded border px-3 py-2">
                <div>
                  <div className="text-sm font-medium">{invite.calendar_key}</div>
                  <div className="text-xs text-muted-foreground">
                    Invited by {invite.invited_by} · {formatLevel(invite.share_level)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => acceptInvite(invite.id)}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => rejectInvite(invite.id)}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Team list */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <div key={team.key} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: team.color ?? '#4a9eff' }}
                />
                <h3 className="font-semibold">{team.name}</h3>
              </div>
              {team.description && (
                <p className="mb-2 text-sm text-muted-foreground">{team.description}</p>
              )}
              <div className="mb-3 flex gap-2">
                <Button
                  size="sm"
                  variant={activeTeam === team.key ? 'default' : 'outline'}
                  onClick={() => setActiveTeam(activeTeam === team.key ? null : team.key)}
                >
                  Manage
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteTeam(team.key)}>
                  Delete
                </Button>
              </div>

              {activeTeam === team.key && <TeamMembersPanel teamKey={team.key} />}
            </div>
          ))}
          {teams.length === 0 && !isLoading && (
            <div className="col-span-full rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No team calendars yet. Create your first one to get started.
            </div>
          )}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team Calendar</DialogTitle>
            <DialogDescription>
              A shared calendar for your team. You will be the owner and can invite members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="team-name">Name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Engineering Team"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="team-color">Color</Label>
              <Input
                id="team-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="team-desc">Description</Label>
              <Input
                id="team-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeamMembersPanel({ teamKey }: { teamKey: string }) {
  const { data: membersData, isLoading } = useListTeamMembersQuery(teamKey)
  const [addMember] = useAddTeamMemberMutation()
  const [updateMember] = useUpdateTeamMemberMutation()
  const [removeMember] = useRemoveTeamMemberMutation()
  const [inviteUser] = useInviteToTeamCalendarMutation()

  const [uid, setUid] = useState('')
  const [level, setLevel] = useState<TeamCalendarShareLevel>('view_all')
  const [inviteMode, setInviteMode] = useState(false)

  const members = membersData?.members ?? []

  async function submit() {
    if (!uid.trim()) return
    if (inviteMode) {
      await inviteUser({ teamId: teamKey, body: { user_uid: uid.trim(), share_level: level } })
    } else {
      await addMember({ teamId: teamKey, body: { user_uid: uid.trim(), share_level: level } })
    }
    setUid('')
    setInviteMode(false)
  }

  return (
    <div className="rounded-md bg-muted/50 p-3">
      <h4 className="mb-2 text-sm font-medium">Members</h4>
      {isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        <ul className="mb-3 space-y-1">
          {members.map((m) => (
            <li key={m.user_uid} className="flex items-center justify-between rounded px-2 py-1 text-sm">
              <span className="truncate">{m.user_uid}</span>
              <span className="flex items-center gap-2">
                <Select
                  value={m.share_level}
                  onValueChange={(v) =>
                    updateMember({ teamId: teamKey, memberUid: m.user_uid, body: { share_level: v as TeamCalendarShareLevel } })
                  }
                >
                  <SelectTrigger className="h-7 w-36 text-xs">
                    <SelectValue>{formatLevel(m.share_level)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SHARE_LEVELS.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>{formatLevel(lvl)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={() => removeMember({ teamId: teamKey, memberUid: m.user_uid })}>
                  Remove
                </Button>
              </span>
            </li>
          ))}
          {members.length === 0 && (
            <li className="text-xs text-muted-foreground">No members yet.</li>
          )}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          placeholder="user@example.org"
          className="h-8 text-xs"
        />
        <Select value={level} onValueChange={(v) => setLevel(v as TeamCalendarShareLevel)}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue>{formatLevel(level)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SHARE_LEVELS.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>{formatLevel(lvl)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={submit} disabled={!uid.trim()}>
          {inviteMode ? 'Invite' : 'Add'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setInviteMode((v) => !v)}>
          {inviteMode ? 'Direct add' : 'Send invite'}
        </Button>
      </div>
    </div>
  )
}
