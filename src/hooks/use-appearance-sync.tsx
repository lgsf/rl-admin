import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const THEME_STORAGE_KEY = 'vite-ui-theme';
const FONT_STORAGE_KEY = 'font';
const SYNC_TIMESTAMP_KEY = 'appearance-sync-timestamp';

interface AppearanceSettings {
  theme: string;
  font: string;
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error';
  lastSync: number | null;
}

export function useAppearanceSync() {
  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: 'system',
    font: 'inter',
    syncStatus: 'synced',
    lastSync: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Convex queries and mutations
  const dbSettings = useQuery(api.appearance.getAppearanceSettings);
  const updateSettings = useMutation(api.appearance.updateAppearanceSettings);
  const syncSettings = useMutation(api.appearance.syncAppearanceSettings);

  // Initialize settings on mount - localStorage first, then database fallback
  useEffect(() => {
    if (!isInitialized) {
      // Step 1: Read from localStorage
      const localTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
      const localFont = localStorage.getItem(FONT_STORAGE_KEY) || 'inter';
      const localTimestamp = parseInt(localStorage.getItem(SYNC_TIMESTAMP_KEY) || '0');

      // Set initial state from localStorage for instant UI
      setSettings({
        theme: localTheme,
        font: localFont,
        syncStatus: 'pending',
        lastSync: localTimestamp,
      });

      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Sync with database when it becomes available
  useEffect(() => {
    if (!isInitialized || dbSettings === undefined) return;

    const syncWithDatabase = async () => {
      if (dbSettings === null) {
        // User not authenticated or no settings in database
        setSettings(prev => ({ ...prev, syncStatus: 'synced' }));
        return;
      }

      const localTimestamp = parseInt(localStorage.getItem(SYNC_TIMESTAMP_KEY) || '0');
      const dbTimestamp = dbSettings.appearanceLastSync || 0;

      // If timestamps differ, perform sync
      if (localTimestamp !== dbTimestamp) {
        try {
          const localTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
          const localFont = localStorage.getItem(FONT_STORAGE_KEY) || 'inter';

          const result = await syncSettings({
            localTheme,
            localFont,
            localTimestamp,
          });

          // Update localStorage based on sync result
          if (result.source === 'database') {
            // Database is newer, update localStorage
            localStorage.setItem(THEME_STORAGE_KEY, result.theme);
            localStorage.setItem(FONT_STORAGE_KEY, result.font);
            localStorage.setItem(SYNC_TIMESTAMP_KEY, result.timestamp.toString());

            setSettings({
              theme: result.theme,
              font: result.font,
              syncStatus: 'synced',
              lastSync: result.timestamp,
            });

            // Dispatch events for theme and font contexts to pick up changes
            window.dispatchEvent(new StorageEvent('storage', {
              key: THEME_STORAGE_KEY,
              newValue: result.theme,
              storageArea: localStorage,
            }));
            window.dispatchEvent(new StorageEvent('storage', {
              key: FONT_STORAGE_KEY,
              newValue: result.font,
              storageArea: localStorage,
            }));
          } else if (result.source === 'local') {
            // Local is newer, database was already updated by sync mutation
            setSettings(prev => ({
              ...prev,
              syncStatus: 'synced',
              lastSync: result.timestamp,
            }));
          } else {
            // Already synced
            setSettings(prev => ({
              ...prev,
              syncStatus: 'synced',
              lastSync: result.timestamp,
            }));
          }
        } catch (error) {
          console.error('Failed to sync appearance settings:', error);
          setSettings(prev => ({ ...prev, syncStatus: 'error' }));
        }
      } else {
        // Already in sync
        setSettings(prev => ({
          ...prev,
          syncStatus: 'synced',
          lastSync: dbTimestamp,
        }));
      }
    };

    syncWithDatabase();
  }, [isInitialized, dbSettings, syncSettings]);

  // Write-through cache: Update both localStorage and database
  const updateAppearance = useCallback(async (
    updates: Partial<{ theme: string; font: string }>
  ) => {
    const timestamp = Date.now();
    
    // Optimistic update to localStorage for instant UI response
    if (updates.theme !== undefined) {
      localStorage.setItem(THEME_STORAGE_KEY, updates.theme);
      window.dispatchEvent(new StorageEvent('storage', {
        key: THEME_STORAGE_KEY,
        newValue: updates.theme,
        storageArea: localStorage,
      }));
    }
    
    if (updates.font !== undefined) {
      localStorage.setItem(FONT_STORAGE_KEY, updates.font);
      window.dispatchEvent(new StorageEvent('storage', {
        key: FONT_STORAGE_KEY,
        newValue: updates.font,
        storageArea: localStorage,
      }));
    }
    
    localStorage.setItem(SYNC_TIMESTAMP_KEY, timestamp.toString());

    // Update local state
    setSettings(prev => ({
      ...prev,
      ...updates,
      syncStatus: 'syncing',
      lastSync: timestamp,
    }));

    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounced database sync (500ms delay)
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await updateSettings(updates);
        setSettings(prev => ({
          ...prev,
          syncStatus: 'synced',
        }));
      } catch (error) {
        console.error('Failed to sync to database:', error);
        setSettings(prev => ({
          ...prev,
          syncStatus: 'error',
        }));
      }
    }, 500);
  }, [updateSettings]);

  // Listen for cross-tab localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        setSettings(prev => ({ ...prev, theme: e.newValue }));
      } else if (e.key === FONT_STORAGE_KEY && e.newValue) {
        setSettings(prev => ({ ...prev, font: e.newValue }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    theme: settings.theme,
    font: settings.font,
    syncStatus: settings.syncStatus,
    lastSync: settings.lastSync,
    updateTheme: (theme: string) => updateAppearance({ theme }),
    updateFont: (font: string) => updateAppearance({ font }),
    updateAppearance,
    isLoading: !isInitialized,
  };
}