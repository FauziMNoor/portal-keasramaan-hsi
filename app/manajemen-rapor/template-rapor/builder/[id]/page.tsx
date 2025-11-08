'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Save,
  Undo,
  Redo,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowLeft,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useTemplateBuilderStore } from '@/lib/stores/template-builder-store';
import { useToast } from '@/components/ui/ToastContainer';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ComponentsSidebar from '@/components/template-builder/ComponentsSidebar';
import Canvas from '@/components/template-builder/Canvas';
import PropertiesPanel from '@/components/template-builder/PropertiesPanel';
import PreviewModal from '@/components/template-builder/PreviewModal';
import KeyboardShortcutsModal from '@/components/template-builder/KeyboardShortcutsModal';
import TemplateBuilderSkeleton from '@/components/template-builder/TemplateBuilderSkeleton';

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

export default function TemplateBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const templateId = params.id as string;

  const {
    templateConfig,
    elements,
    setTemplateConfig,
    setElements,
    isDirty,
    markClean,
    setLoading,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedElementId,
    deleteElement,
    duplicateElement,
  } = useTemplateBuilderStore();

  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showComponentsSidebar, setShowComponentsSidebar] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  // Load template data
  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      const isInputField = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // ?: Show keyboard shortcuts help
      if (e.key === '?' && !isInputField) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
        return;
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canRedo()) redo();
        return;
      }

      // Delete/Backspace: Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputField) {
        e.preventDefault();
        if (selectedElementId) {
          deleteElement(selectedElementId);
          toast.success('Elemen berhasil dihapus');
        }
        return;
      }

      // Ctrl/Cmd + D: Duplicate selected element
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !isInputField) {
        e.preventDefault();
        if (selectedElementId) {
          duplicateElement(selectedElementId);
          toast.success('Elemen berhasil diduplikasi');
        }
        return;
      }

      // Ctrl/Cmd + Plus: Zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        handleZoomIn();
        return;
      }

      // Ctrl/Cmd + Minus: Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, selectedElementId, deleteElement, duplicateElement, toast]);

  const loadTemplate = async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      const response = await fetch(`/api/rapor/template/builder/${templateId}`);
      const result = await response.json();

      if (result.success) {
        setTemplateConfig(result.data.template);
        setElements(result.data.elements || []);
        markClean();
      } else {
        toast.error('Gagal memuat template');
        router.push('/manajemen-rapor/template-rapor');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Terjadi kesalahan saat memuat template');
      router.push('/manajemen-rapor/template-rapor');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!templateConfig) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/rapor/template/builder/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvas_config: templateConfig,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Template berhasil disimpan');
        markClean();
      } else {
        toast.error(result.error || 'Gagal menyimpan template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Terjadi kesalahan saat menyimpan template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleFitToScreen = () => {
    setZoom(100);
  };

  const handleBack = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      router.push('/manajemen-rapor/template-rapor');
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    router.push('/manajemen-rapor/template-rapor');
  };

  // Show skeleton while loading
  if (isLoading || !templateConfig) {
    return <TemplateBuilderSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <div className="hidden sm:block border-l border-gray-300 h-8"></div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                {templateConfig.name}
              </h1>
              <p className="hidden sm:block text-xs text-gray-500">Template Builder</p>
            </div>
          </div>

          {/* Center: Undo/Redo & Zoom Controls - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <button
                onClick={() => undo()}
                disabled={!canUndo()}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-5 h-5" />
              </button>
              <button
                onClick={() => redo()}
                disabled={!canRedo()}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="w-5 h-5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                disabled={zoom === ZOOM_LEVELS[0]}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom Out (Ctrl+-)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ZOOM_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}%
                  </option>
                ))}
              </select>
              <button
                onClick={handleZoomIn}
                disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom In (Ctrl++)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleFitToScreen}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fit to Screen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Help, Preview & Save */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowShortcuts(true)}
              className="hidden sm:block p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden sm:inline">Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">
                    {isDirty ? 'Simpan' : 'Tersimpan'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Toolbar - Second Row */}
        <div className="lg:hidden flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-200">
          {/* Mobile: Components & Properties Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowComponentsSidebar(!showComponentsSidebar);
                setShowPropertiesPanel(false);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showComponentsSidebar
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Components
            </button>
            <button
              onClick={() => {
                setShowPropertiesPanel(!showPropertiesPanel);
                setShowComponentsSidebar(false);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showPropertiesPanel
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Properties
            </button>
          </div>

          {/* Mobile: Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => undo()}
              disabled={!canUndo()}
              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => redo()}
              disabled={!canRedo()}
              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile: Zoom */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom === ZOOM_LEVELS[0]}
              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-600 min-w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Responsive layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Components Sidebar - Collapsible on mobile */}
        <div
          className={`
            ${showComponentsSidebar ? 'absolute inset-0 z-20' : 'hidden'}
            lg:relative lg:block lg:w-64
            bg-white border-r border-gray-200 overflow-y-auto
          `}
        >
          <ComponentsSidebar />
          {/* Mobile close overlay */}
          {showComponentsSidebar && (
            <button
              onClick={() => setShowComponentsSidebar(false)}
              className="lg:hidden absolute top-2 right-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100">
          <Canvas zoom={zoom} />
        </div>

        {/* Right: Properties Panel - Collapsible on mobile */}
        <div
          className={`
            ${showPropertiesPanel ? 'absolute inset-0 z-20' : 'hidden'}
            lg:relative lg:block lg:w-80
            bg-white border-l border-gray-200 overflow-y-auto
          `}
        >
          <PropertiesPanel />
          {/* Mobile close overlay */}
          {showPropertiesPanel && (
            <button
              onClick={() => setShowPropertiesPanel(false)}
              className="lg:hidden absolute top-2 right-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              aria-label="Close panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {templateConfig && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          templateId={templateId}
          templateConfig={templateConfig}
          elements={elements}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Exit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showExitConfirm}
        title="Keluar dari Template Builder"
        message="Ada perubahan yang belum disimpan. Yakin ingin keluar? Semua perubahan yang belum disimpan akan hilang."
        confirmText="Keluar"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={confirmExit}
        onCancel={() => setShowExitConfirm(false)}
      />
    </div>
  );
}
