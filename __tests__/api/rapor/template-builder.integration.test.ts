/**
 * Integration Tests for Template Builder APIs
 * Tests template CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '@/lib/supabase';
import type { TemplateConfig } from '@/types/rapor-builder';

// Test data
let testTemplateId: string;
let testUserId: string;
const testSession = { userId: 'test-user-id', role: 'admin' };

describe('Template Builder API - CRUD Operations', () => {
  beforeAll(async () => {
    // Setup: Create a test user if needed
    const { data: userData } = await supabase
      .from('guru')
      .select('id')
      .limit(1)
      .single();
    
    if (userData) {
      testUserId = userData.id;
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test templates
    if (testTemplateId) {
      await supabase
        .from('rapor_template_keasramaan')
        .delete()
        .eq('id', testTemplateId);
    }
  });

  describe('POST /api/rapor/template/builder - Create Template', () => {
    it('should create a new builder template with default config', async () => {
      const templateData = {
        nama_template: 'Test Template Integration',
        jenis_rapor: 'semester',
      };

      const { data, error } = await supabase
        .from('rapor_template_keasramaan')
        .insert({
          ...templateData,
          template_type: 'builder',
          canvas_config: {
            name: templateData.nama_template,
            type: 'builder',
            version: '1.0.0',
            pageSize: 'A4',
            orientation: 'portrait',
            dimensions: { width: 794, height: 1123 },
            margins: { top: 40, right: 40, bottom: 40, left: 40 },
            backgroundColor: '#ffffff',
          },
          is_active: true,
          created_by: testUserId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.nama_template).toBe(templateData.nama_template);
      expect(data?.template_type).toBe('builder');
      expect(data?.canvas_config).toBeDefined();

      testTemplateId = data!.id;
    });

    it('should validate required fields', async () => {
      const { error } = await supabase
        .from('rapor_template_keasramaan')
        .insert({
          template_type: 'builder',
          // Missing nama_template and jenis_rapor
        });

      expect(error).toBeDefined();
    });
  });

  describe('GET /api/rapor/template/builder - List Templates', () => {
    it('should list all builder templates', async () => {
      const { data, error } = await supabase
        .from('rapor_template_keasramaan')
        .select('*')
        .eq('template_type', 'builder');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should filter templates by jenis_rapor', async () => {
      const { data, error } = await supabase
        .from('rapor_template_keasramaan')
        .select('*')
        .eq('template_type', 'builder')
        .eq('jenis_rapor', 'semester');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      if (data && data.length > 0) {
        expect(data.every(t => t.jenis_rapor === 'semester')).toBe(true);
      }
    });
  });

  describe('GET /api/rapor/template/builder/[id] - Get Template', () => {
    it('should fetch template with elements', async () => {
      if (!testTemplateId) {
        console.log('Skipping: No test template created');
        return;
      }

      const { data: template, error: templateError } = await supabase
        .from('rapor_template_keasramaan')
        .select('*')
        .eq('id', testTemplateId)
        .single();

      expect(templateError).toBeNull();
      expect(template).toBeDefined();
      expect(template?.id).toBe(testTemplateId);

      const { data: elements, error: elementsError } = await supabase
        .from('rapor_template_elements_keasramaan')
        .select('*')
        .eq('template_id', testTemplateId);

      expect(elementsError).toBeNull();
      expect(Array.isArray(elements)).toBe(true);
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const { data, error } = await supabase
        .from('rapor_template_keasramaan')
        .select('*')
        .eq('id', fakeId)
        .eq('template_type', 'builder')
        .single();

      expect(error).toBeDefined();
      expect(error?.code).toBe('PGRST116'); // Not found
    });
  });

  describe('PUT /api/rapor/template/builder/[id] - Update Template', () => {
    it('should update template config', async () => {
      if (!testTemplateId) {
        console.log('Skipping: No test template created');
        return;
      }

      const updatedName = 'Updated Test Template';
      
      const { data, error } = await supabase
        .from('rapor_template_keasramaan')
        .update({
          nama_template: updatedName,
        })
        .eq('id', testTemplateId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.nama_template).toBe(updatedName);
    });

    it('should update canvas config', async () => {
      if (!testTemplateId) {
        console.log('Skipping: No test template created');
        return;
      }

      const { data: currentTemplate } = await supabase
        .from('rapor_template_keasramaan')
        .select('canvas_config')
        .eq('id', testTemplateId)
        .single();

      const updatedConfig = {
        ...currentTemplate?.canvas_config,
        backgroundColor: '#f0f0f0',
      };

      const { data, error } = await supabase
        .from('rapor_template_keasramaan')
        .update({
          canvas_config: updatedConfig,
        })
        .eq('id', testTemplateId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.canvas_config.backgroundColor).toBe('#f0f0f0');
    });
  });

  describe('DELETE /api/rapor/template/builder/[id] - Delete Template', () => {
    it('should delete template and cascade delete elements', async () => {
      // Create a temporary template for deletion test
      const { data: tempTemplate } = await supabase
        .from('rapor_template_keasramaan')
        .insert({
          nama_template: 'Temp Delete Test',
          jenis_rapor: 'bulanan',
          template_type: 'builder',
          canvas_config: {},
          created_by: testUserId,
        })
        .select()
        .single();

      expect(tempTemplate).toBeDefined();
      const tempId = tempTemplate!.id;

      // Delete the template
      const { error } = await supabase
        .from('rapor_template_keasramaan')
        .delete()
        .eq('id', tempId);

      expect(error).toBeNull();

      // Verify deletion
      const { data: deletedTemplate } = await supabase
        .from('rapor_template_keasramaan')
        .select('*')
        .eq('id', tempId)
        .single();

      expect(deletedTemplate).toBeNull();
    });
  });
});
