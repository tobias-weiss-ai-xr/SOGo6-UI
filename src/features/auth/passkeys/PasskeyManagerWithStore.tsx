/**
 * PasskeyManagerWithStore.tsx - Passkey Management Component using Redux Store
 *
 * Integrates with the existing Redux-based auth system.
 * Uses the RTK Query API endpoints from auth.api.ts
 *
 * Spec: sogo6-server/.openspec/specs/webauthn-passkeys.spec.md
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Plus, Trash2, Pencil, ShieldCheck, Clock } from 'lucide-react';

import {
  useWebauthnBeginRegistrationMutation,
  useWebauthnCompleteRegistrationMutation,
  useWebauthnGetCredentialsQuery,
  useWebauthnDeleteCredentialMutation,
} from '@/features/auth/components/store/auth.api';
import { getErrorMessage } from '@/lib/redux/api/error-handlers';

// ============================================================================
// Types
// ============================================================================

interface PasskeyCredential {
  id: number;
  credential_id: string;
  device_name: string;
  transports: string[] | null;
  enabled: boolean;
  created_at: string;
  last_used_at: string | null;
  is_default?: boolean;
}

interface PasskeyManagerWithStoreProps {
  onSuccess?: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ============================================================================
// Main Component
// ============================================================================

export function PasskeyManagerWithStore({ onSuccess }: PasskeyManagerWithStoreProps) {
  const t = useTranslations('AUTH');
  
  // RTK Query hooks
  const {
    data: credentialsData,
    isLoading,
    isError,
    refetch,
  } = useWebauthnGetCredentialsQuery();
  
  const [beginRegistration] = useWebauthnBeginRegistrationMutation();
  const [completeRegistration] = useWebauthnCompleteRegistrationMutation();
  const [deleteCredential] = useWebauthnDeleteCredentialMutation();
  
  // State
  const [credentials, setCredentials] = useState<PasskeyCredential[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<PasskeyCredential | null>(null);
  const [passkeyName, setPasskeyName] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [registering, setRegistering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Check if WebAuthn is supported
  const isSupported = typeof window !== 'undefined' && 
    'credentials' in window && 
    'PublicKeyCredential' in window;
  
  // Load and transform credentials data
  useEffect(() => {
    if (credentialsData?.data?.credentials) {
      setCredentials(credentialsData.data.credentials);
    }
  }, [credentialsData]);
  
  // ============================================================================
  // Passkey Registration
  // ============================================================================
  
  const handleRegister = useCallback(async () => {
    if (!isSupported) {
      toast.error(t('passkey.error.not_supported.string'));
      return;
    }
    
    try {
      setRegistering(true);
      setShowAddDialog(false);
      
      // Step 1: Get registration challenge from server
      const beginResult = await beginRegistration().unwrap();
      const publicKey = beginResult.data.publicKey as PublicKeyCredentialCreationOptions;
      
      // Convert challenge from base64url to ArrayBuffer
      publicKey.challenge = base64urlToBuffer(publicKey.challenge as unknown as string);
      
      // Convert user.id if present
      if (publicKey.user) {
        publicKey.user.id = base64urlToBuffer(publicKey.user.id as unknown as string);
      }
      
      // Convert excludeCredentials if present
      if (publicKey.excludeCredentials) {
        publicKey.excludeCredentials = publicKey.excludeCredentials.map((cred) => ({
          ...cred,
          id: base64urlToBuffer(cred.id as unknown as string),
          type: 'public-key' as const,
        }));
      }
      
      // Step 2: Trigger browser's WebAuthn API
      const credential = (await navigator.credentials.create({
        publicKey,
      })) as PublicKeyCredential | null;
      
      if (!credential) {
        // User cancelled
        toast.info(t('passkey.registrationCancelled.string'));
        return;
      }
      
      // Step 3: Convert credential to JSON format for server
      const credentialResponse = credential.response as AuthenticatorAttestationResponse;
      const credentialData = {
        id: credential.id,
        rawId: base64urlEncode(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: base64urlEncode(credentialResponse.attestationObject),
          clientDataJSON: base64urlEncode(credentialResponse.clientDataJSON),
        },
        clientExtensionResults: credential.getClientExtensionResults?.() ?? {},
      };
      
      // Step 4: Complete registration on server
      await completeRegistration({ 
        credential: credentialData,
        device_name: passkeyName || undefined,
      }).unwrap();
      
      toast.success(t('passkey.registrationSuccess.string'));
      
      // Refresh credentials list
      await refetch();
      
      // Reset form
      setPasskeyName('');
      
      // Notify parent
      onSuccess?.();
      
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error) || t('passkey.registrationFailed.string');
      toast.error(errorMsg);
    } finally {
      setRegistering(false);
    }
  }, [isSupported, beginRegistration, completeRegistration, passkeyName, refetch, onSuccess, t]);
  
  // ============================================================================
  // Passkey Removal
  // ============================================================================
  
  const confirmRemove = (credential: PasskeyCredential) => {
    setSelectedCredential(credential);
    setRemovingId(credential.credential_id);
    setShowRemoveDialog(true);
  };
  
  const handleRemove = async () => {
    if (!removingId) return;
    
    try {
      setActionLoading(true);
      await deleteCredential({ credential_id: removingId }).unwrap();
      toast.success(t('passkeys.removalSuccess') || 'Passkey removed successfully');
      
      // Refresh credentials list
      await refetch();
      
      // Close dialog
      setShowRemoveDialog(false);
      setRemovingId(null);
      setSelectedCredential(null);
      
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error) || t('passkeys.removalFailed') || 'Failed to remove passkey';
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };
  
  // ============================================================================
  // Passkey Rename
  // ============================================================================
  
  const confirmRename = (credential: PasskeyCredential) => {
    setSelectedCredential(credential);
    setRenamingId(credential.id);
    setNewName(credential.device_name);
    setShowRenameDialog(true);
  };
  
  const handleRename = async () => {
    if (!renamingId || !newName.trim()) return;
    
    try {
      setActionLoading(true);
      // Note: The current API doesn't support renaming, but we can add it
      // For now, we'll show a message that rename is not yet supported
      toast.info(t('common.comingSoon') || 'Rename feature coming soon');
      
      setShowRenameDialog(false);
      setRenamingId(null);
      setNewName('');
      setSelectedCredential(null);
      
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error) || t('passkeys.updateFailed') || 'Failed to rename passkey';
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleSetDefault = async (credential: PasskeyCredential) => {
    try {
      setActionLoading(true);
      // Note: The current API doesn't support setting default, but we can add it
      toast.info(t('common.comingSoon') || 'Set default feature coming soon');
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error) || t('passkeys.defaultFailed') || 'Failed to set default';
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };
  
  // ============================================================================
  // Render Functions
  // ============================================================================
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('passkey.title') || 'Passkeys'}</CardTitle>
          <CardDescription>{t('passkey.description') || 'Manage your passkeys'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Browser not supported
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('passkey.title') || 'Passkeys'}</CardTitle>
          <CardDescription>{t('passkey.description') || 'Manage your passkeys'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {t('passkey.error.not_supported.string')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('passkey.error.not_supported_desc') || 'Please use a modern browser to use passkeys.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Main render
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('passkey.title') || 'Passkeys'}</CardTitle>
            <CardDescription>{t('passkey.description') || 'Manage your passkeys'}</CardDescription>
          </div>
          <Button 
            onClick={() => { setShowAddDialog(true); setPasskeyName(''); }}
            disabled={actionLoading}
          >
            <Plus className="mr-2 h-4 w-4" /> 
            {t('passkey.addPasskey') || 'Add Passkey'}
          </Button>
        </CardHeader>
        
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t('passkeys.noPasskeys') || 'No Passkeys Yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('passkeys.noPasskeysDesc') || 'Passkeys provide a secure and convenient way to log in without passwords.'}
              </p>
              <Button 
                onClick={() => { setShowAddDialog(true); setPasskeyName(''); }}
                disabled={actionLoading}
              >
                <Plus className="mr-2 h-4 w-4" /> 
                {t('passkeys.addFirstPasskey') || 'Add Your First Passkey'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('passkeys.name') || 'Name'}</TableHead>
                    <TableHead>{t('passkeys.default') || 'Default'}</TableHead>
                    <TableHead>{t('passkeys.lastUsed') || 'Last Used'}</TableHead>
                    <TableHead>{t('passkeys.createdAt') || 'Created'}</TableHead>
                    <TableHead className="text-right">{t('common.actions') || 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map((cred) => (
                    <TableRow key={cred.credential_id}>
                      <TableCell className="font-medium">{cred.device_name || t('common.unnamed') || 'Unnamed'}</TableCell>
                      <TableCell>
                        {cred.is_default && (
                          <Badge variant="default">{t('common.default') || 'Default'}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {cred.last_used_at ? (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2" />
                            {new Date(cred.last_used_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t('common.none') || 'Never'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(cred.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={actionLoading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!cred.is_default && (
                              <DropdownMenuItem onClick={() => handleSetDefault(cred)} disabled={actionLoading}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                {t('passkeys.setAsDefault') || 'Set as Default'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => confirmRename(cred)} disabled={actionLoading}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t('common.rename') || 'Rename'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => confirmRemove(cred)}
                              className="text-destructive"
                              disabled={actionLoading}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('common.delete') || 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Passkey Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogHeader>
          <DialogTitle>{t('passkeys.addPasskey') || 'Add Passkey'}</DialogTitle>
          <DialogDescription>{t('passkeys.addPasskeyDesc') || 'Create a new passkey for this account.'}</DialogDescription>
        </DialogHeader>
        <DialogContent className="sm:max-w-[425px]">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="passkey-name" className="text-right">
                {t('common.name') || 'Name'}
              </Label>
              <Input
                id="passkey-name"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder={t('passkeys.namePlaceholder') || 'My Passkey'}
                className="col-span-3"
                disabled={registering}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={registering}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleRegister} disabled={registering}>
              {registering ? t('common.registering') || 'Registering...' : t('passkeys.register') || 'Register'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Remove Passkey Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('passkeys.removePasskey') || 'Remove Passkey'}</DialogTitle>
            <DialogDescription>
              {t('passkeys.removeConfirm', { name: selectedCredential?.device_name }) || 
               `Are you sure you want to remove "${selectedCredential?.device_name}"?`}
              {credentials.length === 1 && (
                <span className="block mt-2 text-rose-600">
                  {t('passkeys.removeLastWarning') || 'This is your last passkey.'}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)} disabled={actionLoading}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemove}
              disabled={actionLoading}
            >
              {actionLoading ? t('common.processing') || 'Processing...' : t('common.delete') || 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rename Passkey Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('passkeys.renamePasskey') || 'Rename Passkey'}</DialogTitle>
            <DialogDescription>
              {t('passkeys.renameDesc', { name: selectedCredential?.device_name }) || 
               `Enter a new name for "${selectedCredential?.device_name}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="passkey-new-name" className="text-right">
                {t('common.name') || 'Name'}
              </Label>
              <Input
                id="passkey-new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('passkeys.namePlaceholder') || 'My Passkey'}
                className="col-span-3"
                disabled={actionLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)} disabled={actionLoading}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim() || actionLoading}>
              {actionLoading ? t('common.processing') || 'Processing...' : t('common.save') || 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default PasskeyManagerWithStore;
