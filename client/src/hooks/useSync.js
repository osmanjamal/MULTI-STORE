import { useContext } from 'react';
import { SyncContext } from '../context/SyncContext';

export function useSync() {
  const context = useContext(SyncContext);
  
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  
  return context;
}

export default useSync;