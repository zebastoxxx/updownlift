import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TablePreferences {
  hiddenColumns: string[];
  columnOrder: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export function useTablePreferences(tableName: string) {
  const [preferences, setPreferences] = useState<TablePreferences>({
    hiddenColumns: [],
    columnOrder: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadPreferences = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_table_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .eq('table_name', tableName)
        .maybeSingle();

      if (error) throw error;

      if (data?.preferences) {
        const prefs = data.preferences as any;
        setPreferences({
          hiddenColumns: prefs.hiddenColumns || [],
          columnOrder: prefs.columnOrder || [],
          sortBy: prefs.sortBy,
          sortDirection: prefs.sortDirection,
        });
      }
    } catch (error) {
      console.error('Error loading table preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, tableName]);

  const savePreferences = useCallback(async (newPreferences: TablePreferences) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_table_preferences')
        .upsert({
          user_id: user.id,
          table_name: tableName,
          preferences: newPreferences as any,
        });

      if (error) throw error;

      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving table preferences:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias",
        variant: "destructive",
      });
    }
  }, [user?.id, tableName, toast]);

  const updateColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    const newPreferences = {
      ...preferences,
      hiddenColumns: visible
        ? preferences.hiddenColumns.filter(col => col !== columnId)
        : [...preferences.hiddenColumns, columnId],
    };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  const updateColumnOrder = useCallback((newOrder: string[]) => {
    const newPreferences = {
      ...preferences,
      columnOrder: newOrder,
    };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  const updateSorting = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {
    const newPreferences = {
      ...preferences,
      sortBy,
      sortDirection,
    };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    updateColumnVisibility,
    updateColumnOrder,
    updateSorting,
    savePreferences,
  };
}