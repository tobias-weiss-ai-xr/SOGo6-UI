/**
 * Wipe all offline caches and databases.
 * Useful for testing or when the user wants to reset their offline data.
 */
export async function wipeOfflineCache(): Promise<void> {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => {
      if (name.startsWith('sogo6-')) {
        return caches.delete(name);
      }
      return Promise.resolve();
    })
  );

  // Clear IndexedDB databases if they exist
  if (typeof indexedDB !== 'undefined') {
    const dbsToDelete = ['sogo6-offline-outbox', 'sogo6-offline-mail', 'sogo6-offline-calendar'];
    for (const dbName of dbsToDelete) {
      try {
        await new Promise<void>((resolve, reject) => {
          const req = indexedDB.deleteDatabase(dbName);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch {
        // Ignore errors - database may not exist
      }
    }
  }
}
