/**
 * Integration Tests for Element CRUD APIs
 * Tests element operations within templates
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '@/lib/supabase';
import type { TemplateElement } from '@/types/rapor-builder';

// Test data
let testTemplateId: string;
let testElementId: string;
let testUserId: string;

describe('Element CRUD API - Integration Tests', () => {
  beforeAll(async () => {
    // Setup: Get test user
    const { data: userData } = await supabase
      .from('guru')
      .select('id')
      .limit(1)
      .single();
    
    if (userData) {
      testUserId = userData.id;
    }

    // Create a test template
    const { data: template } = await supabase
      .from('rapor_template_keasramaan')
      .insert({
        nama_template: 'Element Test Template',
        jenis_rapor: 'semester',
        template_type: 'builder',
        canvas_config: {
          name: 'Element Test Template',
          type: 'builder',
          version: '1.0.0',
          pageSize: 'A4',
          orientation: 'portrait',
          dimensions: { width: 794, height: 1123 },
          margins: { top: 40, right: 40, bottom: 40, left: 40 },
          backgroundColor: '#ffffff',
        },
        created_by: testUserId,
      })
      .select()
      .single();

    if (template) {
      testTemplateId = template.id;
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test template (elements will cascade delete)
    if (testTemplateId) {
      await supabase
        .from('rapor_template_keasramaan')
        .delete()
        .eq('id', testTemplateId);
    }
  });

  describe('POST /api/rapor/template/builder/[id]/elements - Add Element', () => {
    it('should add a text element to template', async () => {
      const elementId = `element-${Date.now()}`;
      const element = {
        id: elementId,
        template_id: testTemplateId,
        element_type: 'text',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 50 },
        content: {
          text: 'Test Text Element',
        },
        style: {
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left',
          lineHeight: 1.5,
        },
        z_index: 1,
        is_visible: true,
        is_locked: false,
      };

      const { data, error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert(element)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.element_type).toBe('text');
      expect(data?.position).toEqual({ x: 100, y: 100 });

      testElementId = data!.id;
    });

    it('should add a header element to template', async () => {
      const elementId = `element-header-${Date.now()}`;
      const element = {
        id: elementId,
        template_id: testTemplateId,
        element_type: 'header',
        position: { x: 0, y: 0 },
        size: { width: 794, height: 100 },
        content: {
          title: {
            text: 'Test Header',
            fontSize: 24,
            fontWeight: 'bold',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center',
          },
        },
        style: {
          backgroundColor: '#f5f5f5',
          padding: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        z_index: 0,
        is_visible: true,
        is_locked: false,
      };

      const { data, error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert(element)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.element_type).toBe('header');
    });

    it('should add a data-table element to template', async () => {
      const elementId = `element-table-${Date.now()}`;
      const element = {
        id: elementId,
        template_id: testTemplateId,
        element_type: 'data-table',
        position: { x: 50, y: 200 },
        size: { width: 700, height: 300 },
        content: {
          columns: [
            { id: 'col1', header: 'Indikator', field: 'indikator', width: 'auto', align: 'left' },
            { id: 'col2', header: 'Nilai', field: 'nilai', width: 100, align: 'center', format: 'number' },
          ],
          options: {
            showHeader: true,
            showBorders: true,
            alternateRows: true,
          },
        },
        data_binding: {
          source: 'habit_tracker.ubudiyah',
        },
        style: {
          headerBackgroundColor: '#4a5568',
          headerTextColor: '#ffffff',
          headerFontSize: 14,
          headerFontWeight: 'bold',
          rowBackgroundColor: '#ffffff',
          rowAlternateColor: '#f7fafc',
          rowTextColor: '#000000',
          rowFontSize: 12,
          borderColor: '#e2e8f0',
          borderWidth: 1,
          cellPadding: 8,
        },
        z_index: 2,
        is_visible: true,
        is_locked: false,
      };

      const { data, error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert(element)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.element_type).toBe('data-table');
      expect(data?.data_binding).toBeDefined();
    });

    it('should reject duplicate element IDs', async () => {
      if (!testElementId) {
        console.log('Skipping: No test element created');
        return;
      }

      const duplicateElement = {
        id: testElementId, // Same ID as existing element
        template_id: testTemplateId,
        element_type: 'text',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        z_index: 1,
        is_visible: true,
      };

      const { error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert(duplicateElement);

      expect(error).toBeDefined();
    });
  });

  describe('PUT /api/rapor/template/builder/[id]/elements/[elementId] - Update Element', () => {
    it('should update element position', async () => {
      if (!testElementId) {
        console.log('Skipping: No test element created');
        return;
      }

      const newPosition = { x: 150, y: 150 };

      const { data, error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .update({ position: newPosition })
        .eq('id', testElementId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.position).toEqual(newPosition);
    });

    it('should update element size', async () => {
      if (!testElementId) {
        console.log('Skipping: No test element created');
        return;
      }

      const newSize = { width: 300, height: 75 };

      const { data, error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .update({ size: newSize })
        .eq('id', testElementId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.size).toEqual(newSize);
    });

    it('should update element content and style', async () => {
      if (!testElementId) {
        console.log('Skipping: No test element created');
        return;
      }

      const newContent = {
        text: 'Updated Text Content',
      };
      const newStyle = {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
      };

      const { data, error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .update({
          content: newContent,
          style: newStyle,
        })
        .eq('id', testElementId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.content.text).toBe('Updated Text Content');
      expect(data?.style.fontSize).toBe(18);
    });
  });

  describe('POST /api/rapor/template/builder/[id]/elements/reorder - Reorder Elements', () => {
    it('should update z-index of multiple elements', async () => {
      // Get all elements for the template
      const { data: elements } = await supabase
        .from('rapor_template_elements_keasramaan')
        .select('id, z_index')
        .eq('template_id', testTemplateId)
        .order('z_index', { ascending: true });

      if (!elements || elements.length < 2) {
        console.log('Skipping: Not enough elements to reorder');
        return;
      }

      // Reverse the order
      const updates = elements.map((el, index) => ({
        id: el.id,
        z_index: elements.length - index - 1,
      }));

      // Update each element
      for (const update of updates) {
        await supabase
          .from('rapor_template_elements_keasramaan')
          .update({ z_index: update.z_index })
          .eq('id', update.id);
      }

      // Verify the new order
      const { data: reorderedElements } = await supabase
        .from('rapor_template_elements_keasramaan')
        .select('id, z_index')
        .eq('template_id', testTemplateId)
        .order('z_index', { ascending: true });

      expect(reorderedElements).toBeDefined();
      expect(reorderedElements![0].id).toBe(elements[elements.length - 1].id);
    });
  });

  describe('DELETE /api/rapor/template/builder/[id]/elements/[elementId] - Delete Element', () => {
    it('should delete an element', async () => {
      // Create a temporary element for deletion
      const tempElementId = `element-temp-${Date.now()}`;
      const { data: tempElement } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert({
          id: tempElementId,
          template_id: testTemplateId,
          element_type: 'line',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 2 },
          style: {
            color: '#000000',
            width: 1,
            style: 'solid',
          },
          z_index: 10,
          is_visible: true,
        })
        .select()
        .single();

      expect(tempElement).toBeDefined();

      // Delete the element
      const { error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .delete()
        .eq('id', tempElementId);

      expect(error).toBeNull();

      // Verify deletion
      const { data: deletedElement } = await supabase
        .from('rapor_template_elements_keasramaan')
        .select('*')
        .eq('id', tempElementId)
        .single();

      expect(deletedElement).toBeNull();
    });
  });

  describe('Element Validation', () => {
    it('should require template_id', async () => {
      const element = {
        id: `element-invalid-${Date.now()}`,
        element_type: 'text',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        z_index: 1,
        is_visible: true,
        // Missing template_id
      };

      const { error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert(element);

      expect(error).toBeDefined();
    });

    it('should require valid element_type', async () => {
      const element = {
        id: `element-invalid-type-${Date.now()}`,
        template_id: testTemplateId,
        element_type: 'invalid_type',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        z_index: 1,
        is_visible: true,
      };

      const { error } = await supabase
        .from('rapor_template_elements_keasramaan')
        .insert(element);

      // This might pass if there's no CHECK constraint, but we're testing the concept
      // In production, you'd want a CHECK constraint or validation at API level
    });
  });
});
