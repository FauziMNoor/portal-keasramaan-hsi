'use client';

import { useState } from 'react';
import { useSelectedElement } from '@/lib/stores/template-builder-store';
import { useTemplateBuilderStore } from '@/lib/stores/template-builder-store';
import { useToast } from '@/components/ui/ToastContainer';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Settings, Trash2, Copy, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import HeaderPropertyEditor from './property-editors/HeaderPropertyEditor';
import TextPropertyEditor from './property-editors/TextPropertyEditor';
import DataTablePropertyEditor from './property-editors/DataTablePropertyEditor';
import ImagePropertyEditor from './property-editors/ImagePropertyEditor';
import ImageGalleryPropertyEditor from './property-editors/ImageGalleryPropertyEditor';
import SignaturePropertyEditor from './property-editors/SignaturePropertyEditor';
import LinePropertyEditor from './property-editors/LinePropertyEditor';

export default function PropertiesPanel() {
  const selectedElement = useSelectedElement();
  const { updateElement, deleteElement, duplicateElement } = useTemplateBuilderStore();
  const toast = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedElement) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Settings className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Element Selected
        </h3>
        <p className="text-sm text-gray-500">
          Klik elemen di canvas untuk melihat dan mengedit propertinya
        </p>
      </div>
    );
  }

  const handleChange = (updates: any) => {
    updateElement(selectedElement.id, updates);
  };

  const confirmDelete = () => {
    if (selectedElement) {
      deleteElement(selectedElement.id);
      toast.success('Elemen berhasil dihapus');
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                handleChange({ isVisible: !selectedElement.isVisible });
                toast.success(
                  selectedElement.isVisible ? 'Elemen disembunyikan' : 'Elemen ditampilkan'
                );
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={selectedElement.isVisible ? 'Hide' : 'Show'}
            >
              {selectedElement.isVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                handleChange({ isLocked: !selectedElement.isLocked });
                toast.success(
                  selectedElement.isLocked ? 'Elemen dibuka' : 'Elemen dikunci'
                );
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={selectedElement.isLocked ? 'Unlock' : 'Lock'}
            >
              {selectedElement.isLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                duplicateElement(selectedElement.id);
                toast.success('Elemen berhasil diduplikasi');
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium capitalize">{selectedElement.type}</span> Element
        </div>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Position & Size */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Position & Size</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                value={selectedElement.position.x}
                onChange={(e) =>
                  handleChange({
                    position: {
                      ...selectedElement.position,
                      x: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                value={selectedElement.position.y}
                onChange={(e) =>
                  handleChange({
                    position: {
                      ...selectedElement.position,
                      y: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width</label>
              <input
                type="number"
                value={selectedElement.size.width}
                onChange={(e) =>
                  handleChange({
                    size: {
                      ...selectedElement.size,
                      width: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height</label>
              <input
                type="number"
                value={selectedElement.size.height}
                onChange={(e) =>
                  handleChange({
                    size: {
                      ...selectedElement.size,
                      height: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Type-specific properties using dedicated editors */}
        {selectedElement.type === 'header' && (
          <HeaderPropertyEditor element={selectedElement} onChange={handleChange} />
        )}

        {selectedElement.type === 'text' && (
          <TextPropertyEditor element={selectedElement} onChange={handleChange} />
        )}

        {selectedElement.type === 'data-table' && (
          <DataTablePropertyEditor element={selectedElement} onChange={handleChange} />
        )}

        {selectedElement.type === 'image' && (
          <ImagePropertyEditor element={selectedElement} onChange={handleChange} />
        )}

        {selectedElement.type === 'image-gallery' && (
          <ImageGalleryPropertyEditor element={selectedElement} onChange={handleChange} />
        )}

        {selectedElement.type === 'signature' && (
          <SignaturePropertyEditor element={selectedElement} onChange={handleChange} />
        )}

        {selectedElement.type === 'line' && (
          <LinePropertyEditor element={selectedElement} onChange={handleChange} />
        )}
        <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p>Element ID: {selectedElement.id.slice(0, 8)}...</p>
          <p>Z-Index: {selectedElement.zIndex}</p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus Elemen"
        message={`Apakah Anda yakin ingin menghapus elemen ${selectedElement.type} ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
