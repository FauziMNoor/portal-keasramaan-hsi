'use client';

import { useState } from 'react';
import {
  Type,
  Image,
  Table,
  Minus,
  FileSignature,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Heading1,
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { useTemplateBuilderStore } from '@/lib/stores/template-builder-store';
import type { ElementType, TemplateElement, HeaderElement } from '@/types/rapor-builder';

// Element types with their metadata
const ELEMENT_TYPES = [
  {
    type: 'header' as ElementType,
    label: 'Header',
    icon: Heading1,
    description: 'Logo, judul, dan subtitle',
  },
  {
    type: 'text' as ElementType,
    label: 'Text Block',
    icon: Type,
    description: 'Teks dengan formatting',
  },
  {
    type: 'data-table' as ElementType,
    label: 'Data Table',
    icon: Table,
    description: 'Tabel dengan data binding',
  },
  {
    type: 'image' as ElementType,
    label: 'Image',
    icon: Image,
    description: 'Gambar tunggal',
  },
  {
    type: 'image-gallery' as ElementType,
    label: 'Image Gallery',
    icon: LayoutGrid,
    description: 'Galeri foto kegiatan',
  },
  {
    type: 'signature' as ElementType,
    label: 'Signature',
    icon: FileSignature,
    description: 'Tanda tangan dan nama',
  },
  {
    type: 'line' as ElementType,
    label: 'Line',
    icon: Minus,
    description: 'Garis pembatas',
  },
];

// Data binding fields grouped by source
const DATA_FIELDS = {
  siswa: {
    label: 'Data Siswa',
    fields: [
      { key: 'siswa.nama', label: 'Nama Siswa' },
      { key: 'siswa.nis', label: 'NIS' },
      { key: 'siswa.kelas', label: 'Kelas' },
      { key: 'siswa.asrama', label: 'Asrama' },
      { key: 'siswa.cabang', label: 'Cabang' },
      { key: 'siswa.foto_url', label: 'Foto Siswa' },
    ],
  },
  habit_tracker: {
    label: 'Habit Tracker',
    fields: [
      { key: 'habit_tracker.periode.tahun_ajaran', label: 'Tahun Ajaran' },
      { key: 'habit_tracker.periode.semester', label: 'Semester' },
      { key: 'habit_tracker.ubudiyah.average', label: 'Rata-rata Ubudiyah' },
      { key: 'habit_tracker.ubudiyah.percentage', label: 'Persentase Ubudiyah' },
      { key: 'habit_tracker.akhlaq.average', label: 'Rata-rata Akhlaq' },
      { key: 'habit_tracker.akhlaq.percentage', label: 'Persentase Akhlaq' },
      { key: 'habit_tracker.kedisiplinan.average', label: 'Rata-rata Kedisiplinan' },
      { key: 'habit_tracker.kedisiplinan.percentage', label: 'Persentase Kedisiplinan' },
      { key: 'habit_tracker.kebersihan.average', label: 'Rata-rata Kebersihan' },
      { key: 'habit_tracker.kebersihan.percentage', label: 'Persentase Kebersihan' },
      { key: 'habit_tracker.overall_average', label: 'Rata-rata Keseluruhan' },
      { key: 'habit_tracker.overall_percentage', label: 'Persentase Keseluruhan' },
    ],
  },
  school: {
    label: 'Data Sekolah',
    fields: [
      { key: 'school.nama', label: 'Nama Sekolah' },
      { key: 'school.logo_url', label: 'Logo Sekolah' },
      { key: 'school.alamat', label: 'Alamat' },
      { key: 'school.telepon', label: 'Telepon' },
      { key: 'school.website', label: 'Website' },
    ],
  },
  pembina: {
    label: 'Data Pembina',
    fields: [
      { key: 'pembina.nama', label: 'Nama Pembina' },
      { key: 'pembina.nip', label: 'NIP Pembina' },
    ],
  },
  kepala_sekolah: {
    label: 'Kepala Sekolah',
    fields: [
      { key: 'kepala_sekolah.nama', label: 'Nama Kepala Sekolah' },
      { key: 'kepala_sekolah.nip', label: 'NIP Kepala Sekolah' },
    ],
  },
};

// Draggable component item
function DraggableComponentItem({
  type,
  label,
  icon: Icon,
  description,
  onAdd,
}: {
  type: ElementType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  onAdd: (type: ElementType) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `component-${type}`,
    data: { type },
  });

  return (
    <div className="relative group">
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-move transition-all ${
          isDragging ? 'opacity-50 scale-95' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
            <p className="text-xs text-gray-600 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      {/* Add button - appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd(type);
        }}
        className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
        title="Klik untuk menambahkan ke canvas"
      >
        + Add
      </button>
    </div>
  );
}

// Data field item (for copying placeholder)
function DataFieldItem({ fieldKey, label }: { fieldKey: string; label: string }) {
  const handleCopy = () => {
    const placeholder = `{{${fieldKey}}}`;
    navigator.clipboard.writeText(placeholder);
    // TODO: Show toast notification
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group"
      title={`Klik untuk copy: {{${fieldKey}}}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          {`{{${fieldKey}}}`}
        </span>
      </div>
    </button>
  );
}

// Helper to create default element
function createDefaultElement(type: ElementType): TemplateElement {
  const baseElement = {
    id: crypto.randomUUID(),
    type,
    position: { x: 50, y: 50 }, // Default position
    size: { width: 200, height: 100 },
    zIndex: 0,
    isVisible: true,
    isLocked: false,
  };

  switch (type) {
    case 'header':
      return {
        ...baseElement,
        size: { width: 700, height: 120 },
        content: {
          title: {
            text: 'Judul Rapor',
            fontSize: 24,
            fontWeight: '700',
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            align: 'center',
          },
          subtitle: {
            text: 'Subtitle',
            fontSize: 16,
            color: '#666666',
          },
        },
        style: {
          backgroundColor: 'transparent',
          borderColor: '#e5e7eb',
          borderWidth: 0,
          borderRadius: 0,
          padding: { top: 16, right: 16, bottom: 16, left: 16 },
        },
      } as HeaderElement;
    case 'text':
      return {
        ...baseElement,
        type: 'text',
        size: { width: 400, height: 100 },
        content: {
          text: 'Teks baru',
          richText: false,
        },
        style: {
          fontSize: 14,
          fontWeight: '400',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
          backgroundColor: 'transparent',
          textAlign: 'left',
          lineHeight: 1.5,
          padding: { top: 8, right: 8, bottom: 8, left: 8 },
        },
      };
    case 'data-table':
      return {
        ...baseElement,
        size: { width: 700, height: 300 },
        content: {
          columns: [],
          dataSource: '',
        },
        style: {
          headerBgColor: '#f3f4f6',
          borderColor: '#e5e7eb',
          fontSize: 12,
        },
      } as any;
    case 'image':
      return {
        ...baseElement,
        size: { width: 200, height: 200 },
        content: {
          source: 'upload',
          value: '',
          alt: 'Image',
        },
        style: {
          objectFit: 'cover',
          borderRadius: 0,
        },
      } as any;
    case 'signature':
      return {
        ...baseElement,
        size: { width: 200, height: 100 },
        content: {
          name: {
            text: '',
            binding: '',
          },
          title: {
            text: '',
            binding: '',
          },
        },
        style: {
          fontSize: 12,
          textAlign: 'center',
          lineHeight: 80,
        },
      } as any;
    default:
      return baseElement as any;
  }
}

export default function ComponentsSidebar() {
  const [activeTab, setActiveTab] = useState<'components' | 'data'>('components');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['siswa', 'habit_tracker']);
  const { addElement, elements } = useTemplateBuilderStore();

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleAddElement = (type: ElementType) => {
    const newElement = createDefaultElement(type);
    newElement.zIndex = elements.length;
    addElement(newElement);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('components')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'components'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Components
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'data'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Data Fields
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'components' ? (
          <div className="space-y-3">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Drag to Canvas
              </h3>
              <p className="text-xs text-gray-600">
                Drag komponen ke canvas untuk menambahkan elemen
              </p>
            </div>
            {ELEMENT_TYPES.map((element) => (
              <DraggableComponentItem
                key={element.type}
                type={element.type}
                label={element.label}
                icon={element.icon}
                description={element.description}
                onAdd={handleAddElement}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Available Data
              </h3>
              <p className="text-xs text-gray-600">
                Klik field untuk copy placeholder
              </p>
            </div>
            {Object.entries(DATA_FIELDS).map(([groupKey, group]) => (
              <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-800">{group.label}</span>
                  {expandedGroups.includes(groupKey) ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {expandedGroups.includes(groupKey) && (
                  <div className="p-2 space-y-1">
                    {group.fields.map((field) => (
                      <DataFieldItem
                        key={field.key}
                        fieldKey={field.key}
                        label={field.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
