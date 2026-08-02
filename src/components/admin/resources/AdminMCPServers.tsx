import { useEffect, useState, useCallback } from 'react';
import AdminDataTable from '../AdminDataTable';
import ResourceDialog from '../ResourceDialog';
import { useResourceCRUD } from '../useResourceCRUD';
import { ExternalLink } from 'lucide-react';
import type { AdminMCPResource, AdminListParams, AdminListResponse } from './types';

const API_PATH = '/api/admin/mcp-servers';

const FIELDS = [
  { key: 'name', label: 'Name', required: true, placeholder: 'e.g. Filesystem MCP' },
  { key: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Brief description' },
  { key: 'url', label: 'URL', type: 'url' as const, placeholder: 'https://github.com/...' },
  { key: 'author', label: 'Author', placeholder: 'e.g. Anthropic' },
  { key: 'tags', label: 'Tags (comma-separated)', placeholder: 'filesystem, local' },
];

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description', render: (row: AdminMCPResource) => (
    <span className="line-clamp-1" title={row.description}>{row.description}</span>
  )},
  { key: 'url', label: 'Link', render: (row: AdminMCPResource) => (
    <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
      <ExternalLink className="h-4 w-4" />
    </a>
  )},
  { key: 'addedDate', label: 'Added', sortable: true, render: (row: AdminMCPResource) => new Date(row.addedDate).toLocaleDateString() },
];

export default function AdminMCPServers() {
  const [data, setData] = useState<AdminMCPResource[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<AdminListParams>({ page: 1, search: '', sortBy: 'createdAt', order: 'desc' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: params.page.toString(), limit: '10', search: params.search, sortBy: params.sortBy, order: params.order });
      const res = await fetch(`${API_PATH}?${query}`);
      const result: AdminListResponse<AdminMCPResource> = await res.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, [params]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const crud = useResourceCRUD(API_PATH, fetchData);

  const handleOpenEdit = (row: AdminMCPResource) => {
    crud.openEdit({ ...row, tags: Array.isArray(row.tags) ? row.tags.join(', ') : row.tags ?? '' });
  };

  const handleConfirm = async () => {
    crud.handleChange('tags',
      typeof crud.formValues.tags === 'string'
        ? crud.formValues.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : crud.formValues.tags
    );
    await crud.handleConfirm();
  };

  const dialogTitle = crud.dialogMode === 'create' ? 'Add MCP Server' : crud.dialogMode === 'edit' ? 'Edit MCP Server' : 'Delete MCP Server';

  return (
    <>
      <AdminDataTable
        title="MCP Servers"
        columns={COLUMNS}
        data={data}
        pagination={pagination}
        isLoading={loading}
        onPageChange={(p) => setParams(prev => ({ ...prev, page: p }))}
        onSearch={(q) => setParams(prev => ({ ...prev, search: q, page: 1 }))}
        onSort={(key) => setParams(prev => ({ ...prev, sortBy: key, order: prev.order === 'asc' ? 'desc' : 'asc' }))}
        onAdd={() => crud.openCreate({ tags: '' })}
        onEdit={handleOpenEdit}
        onDelete={crud.openDelete}
      />
      {crud.dialogMode && (
        <ResourceDialog mode={crud.dialogMode} title={dialogTitle} fields={FIELDS} values={crud.formValues}
          onChange={crud.handleChange} onConfirm={handleConfirm} onClose={crud.close}
          loading={crud.saving} recordName={(crud.selectedRecord as any)?.name} />
      )}
    </>
  );
}
