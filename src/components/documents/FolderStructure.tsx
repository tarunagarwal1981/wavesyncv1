'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FolderOpen, 
  FileIcon, 
  Plus,
  MoreHorizontal,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { 
  DocumentFolderType, 
  FOLDER_TYPE_LABELS, 
  FOLDER_TYPE_ICONS,
  FOLDER_TYPE_COLORS 
} from '@/lib/documents/types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface FolderStructureProps {
  folders: Array<{
    id: string;
    name: string;
    type: DocumentFolderType;
    documentCount: number;
  }>;
  selectedFolder?: DocumentFolderType;
  onFolderSelect?: (folderType: DocumentFolderType) => void;
  onCreateFolder?: () => void;
  onManageFolders?: () => void;
  variant?: 'sidebar' | 'compact';
  className?: string;
}

interface FolderItemProps {
  folder: {
    id: string;
    name: string;
    type: DocumentFolderType;
    documentCount: number;
  };
  isSelected: boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

function FolderItem({ folder, isSelected, onClick, onRename, onDelete }: FolderItemProps) {
  const icon = FOLDER_TYPE_ICONS[folder.type];
  const colors = FOLDER_TYPE_COLORS[folder.type];

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${
          isSelected ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {folder.name}
        </div>
        <div className="text-xs text-gray-500">
          {folder.documentCount} document{folder.documentCount !== 1 ? 's' : ''}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRename}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function FolderStructure({ 
  folders, 
  selectedFolder, 
  onFolderSelect,
  onCreateFolder,
  onManageFolders,
  variant = 'sidebar',
  className 
}: FolderStructureProps) {
  const sortedFolders = folders.sort((a, b) => {
    // Put custom folders first, then alphabetically
    const aIsCustom = !Object.values(FOLDER_TYPE_LABELS).includes(a.name);
    const bIsCustom = !Object.values(FOLDER_TYPE_LABELS).includes(b.name);
    
    if (aIsCustom && !bIsCustom) return -1;
    if (!aIsCustom && bIsCustom) return 1;
    
    return a.name.localeCompare(b.name);
  });

  const defaultFolders = sortedFolders.filter(f => 
    Object.values(FOLDER_TYPE_LABELS).includes(f.name)
  );
  const customFolders = sortedFolders.filter(f => 
    !Object.values(FOLDER_TYPE_LABELS).includes(f.name)
  );

  const handleFolderClick = (folderType: DocumentFolderType) => {
    onFolderSelect?.(folderType);
  };

  const handleRenameFolder = (folderType: DocumentFolderType) => {
    // Implement rename functionality
    console.log('Rename folder:', folderType);
  };

  const handleDeleteFolder = (folderType: DocumentFolderType) => {
    // Implement delete functionality
    console.log('Delete folder:', folderType);
  };

  if (variant === 'compact') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Folders</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCreateFolder}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {folders.map(folder => (
            <div
              key={folder.id}
              className={`flex items-center gap-2 p-1 rounded cursor-pointer text-sm transition-colors ${
                selectedFolder === folder.type 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleFolderClick(folder.type)}
            >
              <span className="text-sm">{FOLDER_TYPE_ICONS[folder.type] || '📁'}</span>
              <span className="truncate">{folder.name}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {folder.documentCount}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Folders
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateFolder}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
            {onManageFolders && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onManageFolders}
                className="h-6 w-6 p-0"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Default Folders */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Default Folders
          </h4>
          <div className="space-y-1">
            {defaultFolders.map(folder => (
              <div key={folder.id} className="group">
                <FolderItem
                  folder={folder}
                  isSelected={selectedFolder === folder.type}
                  onClick={() => handleFolderClick(folder.type)}
                  onRename={() => handleRenameFolder(folder.type)}
                  onDelete={() => handleDeleteFolder(folder.type)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Custom Folders */}
        {customFolders.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Custom Folders
            </h4>
            <div className="space-y-1">
              {customFolders.map(folder => (
                <div key={folder.id} className="group">
                  <FolderItem
                    folder={folder}
                    isSelected={selectedFolder === folder.type}
                    onClick={() => handleFolderClick(folder.type)}
                    onRename={() => handleRenameFolder(folder.type)}
                    onDelete={() => handleDeleteFolder(folder.type)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {folders.reduce((sum, folder) => sum + folder.documentCount, 0)}
              </div>
              <div className="text-xs text-gray-500">Total Documents</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {folders.length}
              </div>
              <div className="text-xs text-gray-500">Folders</div>
            </div>
          </div>
        </div>

        {/* Create New Folder */}
        <div className="pt-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCreateFolder}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Folder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
