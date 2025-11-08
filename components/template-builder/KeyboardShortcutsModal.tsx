'use client';

import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // General
  {
    keys: ['Ctrl', 'S'],
    description: 'Simpan template',
    category: 'General',
  },
  {
    keys: ['?'],
    description: 'Tampilkan bantuan keyboard shortcuts',
    category: 'General',
  },

  // Edit
  {
    keys: ['Ctrl', 'Z'],
    description: 'Undo',
    category: 'Edit',
  },
  {
    keys: ['Ctrl', 'Shift', 'Z'],
    description: 'Redo',
    category: 'Edit',
  },
  {
    keys: ['Delete'],
    description: 'Hapus elemen yang dipilih',
    category: 'Edit',
  },
  {
    keys: ['Backspace'],
    description: 'Hapus elemen yang dipilih',
    category: 'Edit',
  },
  {
    keys: ['Ctrl', 'D'],
    description: 'Duplikasi elemen yang dipilih',
    category: 'Edit',
  },

  // View
  {
    keys: ['Ctrl', '+'],
    description: 'Zoom in',
    category: 'View',
  },
  {
    keys: ['Ctrl', '-'],
    description: 'Zoom out',
    category: 'View',
  },
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  // Group shortcuts by category
  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  // Detect OS for display
  const isMac =
    typeof window !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  const formatKeys = (keys: string[]) => {
    return keys.map((key) => {
      if (key === 'Ctrl') return modKey;
      if (key === 'Shift') return isMac ? '⇧' : 'Shift';
      if (key === 'Delete') return isMac ? '⌫' : 'Del';
      if (key === 'Backspace') return isMac ? '⌫' : 'Backspace';
      return key;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {categories.map((category) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-700">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {formatKeys(shortcut.keys).map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center">
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-gray-400">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Tip:</span> Tekan{' '}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow-sm">
              ?
            </kbd>{' '}
            kapan saja untuk membuka bantuan ini.
          </p>
        </div>
      </div>
    </div>
  );
}
