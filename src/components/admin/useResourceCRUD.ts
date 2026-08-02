import { useState, useCallback } from 'react';
import type { DialogMode } from './ResourceDialog';

/**
 * Manages Create/Edit/Delete dialog state and API calls for an admin resource.
 *
 * @param apiPath  - e.g. '/api/admin/ai-tools'
 * @param onRefresh - called after a successful mutation to re-fetch the table
 */
export function useResourceCRUD(apiPath: string, onRefresh: () => void) {
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record<string, any> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = useCallback((defaults: Record<string, any> = {}) => {
    setSelectedRecord(null);
    setFormValues(defaults);
    setError(null);
    setDialogMode('create');
  }, []);

  const openEdit = useCallback((record: Record<string, any>) => {
    setSelectedRecord(record);
    setFormValues({ ...record });
    setError(null);
    setDialogMode('edit');
  }, []);

  const openDelete = useCallback((record: Record<string, any>) => {
    setSelectedRecord(record);
    setFormValues({});
    setError(null);
    setDialogMode('delete');
  }, []);

  const close = useCallback(() => {
    setDialogMode(null);
    setSelectedRecord(null);
    setFormValues({});
    setError(null);
  }, []);

  const handleChange = useCallback((key: string, value: any) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleConfirm = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      let res: Response;

      if (dialogMode === 'create') {
        res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        });
      } else if (dialogMode === 'edit') {
        res = await fetch(`${apiPath}/${selectedRecord!._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        });
      } else {
        // delete
        res = await fetch(`${apiPath}/${selectedRecord!._id}`, { method: 'DELETE' });
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }

      onRefresh();
      close();
    } catch (err: any) {
      setError(err.message ?? 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  }, [dialogMode, formValues, selectedRecord, apiPath, onRefresh, close]);

  return {
    dialogMode,
    selectedRecord,
    formValues,
    saving,
    error,
    openCreate,
    openEdit,
    openDelete,
    close,
    handleChange,
    handleConfirm,
  };
}
