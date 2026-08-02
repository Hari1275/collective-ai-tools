import { useEffect, useState, useCallback } from 'react';
import AdminDataTable from '../AdminDataTable';
import ResourceDialog from '../ResourceDialog';
import { useResourceCRUD } from '../useResourceCRUD';
import type { AdminListParams } from './types';

const API_PATH = '/api/admin/categories';

const FIELDS = [
  { key: 'name', label: 'Name', required: true, placeholder: 'e.g. Developer Tools' },
  { key: 'slug', label: 'Slug', required: true, placeholder: 'e.g. developer-tools' },
  { key: 'type', label: 'Type', placeholder: 'e.g. general' },
];

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'type', label: 'Type' },
];

export default function AdminCategories() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<AdminListParams>({ page: 1, search: '', sortBy: 'name', order: 'asc' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: params.page.toString(), limit: '10', search: params.search, sortBy: params.sortBy, order: params.order });
      const res = await fetch(`${API_PATH}?${query}`);
      const result = await res.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, [params]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const crud = useResourceCRUD(API_PATH, fetchData);

  const dialogTitle = crud.dialogMode === 'create' ? 'Add Category' : crud.dialogMode === 'edit' ? 'Edit Category' : 'Delete Category';

  return (
    <>
      <AdminDataTable
        title="Categories"
        columns={COLUMNS}
        data={data}
        pagination={pagination}
        isLoading={loading}
        onPageChange={(p) => setParams(prev => ({ ...prev, page: p }))}
        onSearch={(q) => setParams(prev => ({ ...prev, search: q, page: 1 }))}
        onSort={(key) => setParams(prev => ({ ...prev, sortBy: key, order: prev.order === 'asc' ? 'desc' : 'asc' }))}
        onAdd={() => crud.openCreate()}
        onEdit={crud.openEdit}
        onDelete={crud.openDelete}
      />
      {crud.dialogMode && (
        <ResourceDialog mode={crud.dialogMode} title={dialogTitle} fields={FIELDS} values={crud.formValues}
          onChange={crud.handleChange} onConfirm={crud.handleConfirm} onClose={crud.close}
          loading={crud.saving} recordName={(crud.selectedRecord as any)?.name} />
      )}
    </>
  );
}
