import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Note as NoteIcon, Folder as FolderIcon, Settings as SettingsIcon } from '@mui/icons-material';

export default function MobileBottomNav({ value, onChange }) {
  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation value={value} onChange={onChange}>
        <BottomNavigationAction label="Notes" value="notes" icon={<NoteIcon />} />
        <BottomNavigationAction label="Folders" value="folders" icon={<FolderIcon />} />
        <BottomNavigationAction label="Settings" value="settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
}