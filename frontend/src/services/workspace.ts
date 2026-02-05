const STORAGE_KEY = 'moniart_workspace_id';

function generateId(): string {
  return crypto.randomUUID();
}

export function getWorkspaceId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
