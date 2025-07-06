import apiClient from './apiClient';

export const notesApi = {
  // Get all notes
  getNotes: async () => {
    return await apiClient.get('/notes');
  },
  
  // Get single note by ID
  getNote: async (id) => {
    return await apiClient.get(`/notes/${id}`);
  },
  
  // Create new note
  createNote: async (noteData) => {
    return await apiClient.post('/notes', noteData);
  },
  
  // Update existing note
  updateNote: async (id, noteData) => {
    return await apiClient.patch(`/notes/${id}`, noteData);
  },
  
  // Delete note
  deleteNote: async (id) => {
    return await apiClient.delete(`/notes/${id}`);
  },
  
  // Unlock protected note
  unlockNote: async (id, password) => {
    return await apiClient.post(`/notes/${id}/unlock`, { password });
  },
  
  // Get note version history
  getNoteVersions: async (id) => {
    return await apiClient.get(`/notes/${id}/versions`);
  },
  
  // Revert note to specific version
  revertToVersion: async (noteId, versionId) => {
    return await apiClient.post(`/notes/${noteId}/revert`, { versionId });
  }
}; 