/**
 * PasskeyManager.tsx - Passkey Management Component
 *
 * Allows users to view, add, and manage their WebAuthn passkeys.
 *
 * Spec: sogo6-server/.openspec/specs/webauthn-passkeys.spec.md
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Trash2, Pencil, ShieldCheck, Clock } from 'lucide-react';

import { checkWebAuthnSupport, listPasskeys, removePasskey, updatePasskey, completeRegistration } from '@/lib/webauthn';

import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// Types
// ============================================================================

interface WebAuthnCredential {
  id: string;
  name: string;
  is_default: boolean;
  sign_count: number;
  last_used_at: string | null;
  created_at: string;
}

interface PasskeyManagerProps {
  onSuccess?: () => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function PasskeyManager({ onSuccess }: PasskeyManagerProps) {
  const { t } = useTranslation('auth');
  
  // State
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [policy, setPolicy] = useState<{ require_webauthn: boolean; allow_password_fallback: boolean } | null>(null);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<WebAuthnCredential | null>(null);
  const [passkeyName, setPasskeyName] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  
  // Register state
  const [registering, setRegistering] = useState(false);
  
  // ============================================================================
  // Data Fetching
  // ============================================================================
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check support
      const support = await checkWebAuthnSupport();
      setSupported(support.supported);
      setPolicy({
        require_webauthn: support.require_webauthn,
        allow_password_fallback: support.allow_password_fallback
      });
      
      // List passkeys
      const response = await listPasskeys();
      setCredentials(response.credentials);
      
    } catch (error) {
      console.error('Failed to fetch passkey data:', error);
      toast.error(t('passkeys.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // ============================================================================
  // Passkey Registration
  // ============================================================================
  
  const handleRegister = async () => {
    if (!supported) {
      toast.error(t('passkeys.browserNotSupported'));
      return;
    }
    
    try {
      setRegistering(true);
      setShowAddDialog(false);
      
      // Complete registration
      await completeRegistration(passkeyName || undefined);
      
      // Success!
      toast.success(t('passkeys.registrationSuccess'));
      
      // Refresh data
      await fetchData();
      
      // Reset form
      setPasskeyName('');
      
      // Notify parent if needed
      onSuccess?.();
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      let message = t('passkeys.registrationFailed');
      if (error.message.includes('cancelled') || error.message.includes('cancel')) {
        message = t('passkeys.registrationCancelled');
      } else if (error.message.includes('not supported')) {
        message = t('passkeys.browserNotSupported');
      }
      
      toast.error(message);
    } finally {
      setRegistering(false);
    }
  };
  
  // ============================================================================
  // Passkey Removal
  // ============================================================================
  
  const confirmRemove = (credential: WebAuthnCredential) => {
    setSelectedCredential(credential);
    setRemovingId(credential.id);
    setShowRemoveDialog(true);
  };
  
  const handleRemove = async () => {
    if (!removingId) return;
    
    try {
      await removePasskey(removingId);
      toast.success(t('passkeys.removalSuccess'));
      
      // Refresh data
      await fetchData();
      
      // Close dialog
      setShowRemoveDialog(false);
      setRemovingId(null);
      setSelectedCredential(null);
      
      // If this was the default, check if there are others and set one
      const updatedCreds = await listPasskeys();
      if (selectedCredential?.is_default && updatedCreds.count > 0) {
        // Auto-set the first remaining as default
        await updatePasskey(updatedCreds.credentials[0].id, { is_default: true });
      }
      
    } catch (error) {
      console.error('Failed to remove passkey:', error);
      toast.error(t('passkeys.removalFailed'));
    }
  };
  
  // ============================================================================
  // Passkey Rename/Update
  // ============================================================================
  
  const confirmRename = (credential: WebAuthnCredential) => {
    setSelectedCredential(credential);
    setRenamingId(credential.id);
    setNewName(credential.name);
    setShowRenameDialog(true);
  };
  
  const handleRename = async () => {
    if (!renamingId || !newName.trim()) return;
    
    try {
      await updatePasskey(renamingId, { name: newName.trim() });
      toast.success(t('passkeys.updateSuccess'));
      
      // Refresh data
      await fetchData();
      
      // Close dialog
      setShowRenameDialog(false);
      setRenamingId(null);
      setNewName('');
      setSelectedCredential(null);
      
    } catch (error) {
      console.error('Failed to rename passkey:', error);
      toast.error(t('passkeys.updateFailed'));
    }
  };
  
  // ============================================================================
  // Set as Default
  // ============================================================================
  
  const handleSetDefault = async (credential: WebAuthnCredential) => {
    if (credential.is_default) return;
    
    try {
      await updatePasskey(credential.id, { is_default: true });
      toast.success(t('passkeys.defaultSuccess'));
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      console.error('Failed to set default passkey:', error);
      toast.error(t('passkeys.defaultFailed'));
    }
  };
  
  // ============================================================================
  // Render Functions
  // ============================================================================
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('passkeys.title')}</CardTitle>
          <CardDescription>{t('passkeys.description')}</CardDescription>
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
  if (supported === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('passkeys.title')}</CardTitle>
          <CardDescription>{t('passkeys.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('passkeys.browserNotSupported')}</h3>
            <p className="text-sm text-muted-foreground">{t('passkeys.browserNotSupportedDesc')}</p>
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
            <CardTitle>{t('passkeys.title')}</CardTitle>
            <CardDescription>{t('passkeys.description')}</CardDescription>
          </div>
          <Button onClick={() => { setShowAddDialog(true); setPasskeyName(''); }}>
            <Plus className="mr-2 h-4 w-4" /> {t('passkeys.addPasskey')}
          </Button>
        </CardHeader>
        
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('passkeys.noPasskeys')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('passkeys.noPasskeysDesc')}</p>
              <Button onClick={() => { setShowAddDialog(true); setPasskeyName(''); }}>
                <Plus className="mr-2 h-4 w-4" /> {t('passkeys.addFirstPasskey')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {policy?.require_webauthn && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                  {t('passkeys.requiredNotice')}
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('passkeys.name')}</TableHead>
                    <TableHead>{t('passkeys.default')}</TableHead>
                    <TableHead>{t('passkeys.lastUsed')}</TableHead>
                    <TableHead>{t('passkeys.signCount')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map((cred) => (
                    <TableRow key={cred.id}>
                      <TableCell className="font-medium">{cred.name}</TableCell>
                      <TableCell>
                        {cred.is_default && (
                          <Badge variant="default">{t('common.default')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {cred.last_used_at ? (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2" />
                            {new Date(cred.last_used_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t('common.none')}</span>
                        )}
                      </TableCell>
                      <TableCell>{cred.sign_count}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!cred.is_default && (
                              <DropdownMenuItem onClick={() => handleSetDefault(cred)}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                {t('passkeys.setAsDefault')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => confirmRename(cred)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t('common.rename')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => confirmRemove(cred)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('common.delete')}
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
          <DialogTitle>{t('passkeys.addPasskey')}</DialogTitle>
          <DialogDescription>{t('passkeys.addPasskeyDesc')}</DialogDescription>
        </DialogHeader>
        <DialogContent className="sm:max-w-[425px]">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="passkey-name" className="text-right">
                {t('common.name')}
              </Label>
              <Input
                id="passkey-name"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder={t('passkeys.namePlaceholder')}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={registering}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRegister} disabled={registering}>
              {registering ? t('common.registering') : t('passkeys.register')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Remove Passkey Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('passkeys.removePasskey')}</DialogTitle>
            <DialogDescription>
              {t('passkeys.removeConfirm', { name: selectedCredential?.name })}
              {credentials.length === 1 && (
                <span className="block mt-2 text-rose-600">
                  {t('passkeys.removeLastWarning')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemove}
              disabled={registering}
            >
              {registering ? t('common.processing') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rename Passkey Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('passkeys.renamePasskey')}</DialogTitle>
            <DialogDescription>
              {t('passkeys.renameDesc', { name: selectedCredential?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="passkey-new-name" className="text-right">
                {t('common.name')}
              </Label>
              <Input
                id="passkey-new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('passkeys.namePlaceholder')}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim() || registering}>
              {registering ? t('common.processing') : t('common.save')}
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

export default PasskeyManager;
