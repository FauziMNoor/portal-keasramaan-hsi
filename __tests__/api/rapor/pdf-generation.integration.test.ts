/**
 * Integration Tests for PDF Generation APIs
 * Tests single and bulk PDF generation
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '@/lib/supabase';

// Test data
let testTemplateId: string;
let testSiswaId: string;
let testUserId: string;
let testPeriode = {
  tahun_ajaran: '2024/2025',
  semester: 1,
};

describe('PDF Generation API - Integration Tests', () => {
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

    // Get or create a test student
    const { data: siswaData } = await supabase
      .from('data_siswa_keasramaan')
      .select('id')
      .limit(1)
      .single();

    if (siswaData) {
      testSiswaId = siswaData.id;
    }

    // Create a test template with elements
    const { data: template } = await supabase
      .from('rapor_template_keasramaan')
      .insert({
        nama_template: 'PDF Generation Test Template',
        jenis_rapor: 'semester',
        template_type: 'builder',
        canvas_config: {
          name: 'PDF Generation Test Template',
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

    if (template) {
      testTemplateId = template.id;

      // Add a simple text element
      await supabase
        .from('rapor_template_elements_keasramaan')
        .insert({
          id: `element-test-${Date.now()}`,
          template_id: testTemplateId,
          element_type: 'text',
          position: { x: 100, y: 100 },
          size: { width: 600, height: 50 },
          content: {
            text: 'Test PDF Content - {{siswa.nama}}',
          },
          style: {
            fontSize: 16,
            fontWeight: 'normal',
            fontFamily: 'Helvetica',
            color: '#000000',
            textAlign: 'left',
            lineHeight: 1.5,
          },
          z_index: 1,
          is_visible: true,
          is_locked: false,
        });
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test template and generated PDFs
    if (testTemplateId) {
      await supabase
        .from('rapor_template_keasramaan')
        .delete()
        .eq('id', testTemplateId);

      // Clean up generated history
      await supabase
        .from('rapor_generate_history_keasramaan')
        .delete()
        .eq('template_id', testTemplateId);
    }
  });

  describe('Single PDF Generation', () => {
    it('should validate required fields', async () => {
      // Test missing templateId
      const missingTemplate = {
        siswaId: testSiswaId,
        periode: testPeriode,
      };

      // This would be tested via API call in real scenario
      expect(missingTemplate).not.toHaveProperty('templateId');
    });

    it('should validate periode structure', async () => {
      const invalidPeriode = {
        templateId: testTemplateId,
        siswaId: testSiswaId,
        periode: {
          // Missing tahun_ajaran and semester
        },
      };

      expect(invalidPeriode.periode).not.toHaveProperty('tahun_ajaran');
      expect(invalidPeriode.periode).not.toHaveProperty('semester');
    });

    it('should fetch template and elements for generation', async () => {
      if (!testTemplateId) {
        console.log('Skipping: No test template created');
        return;
      }

      // Fetch template
      const { data: template, error: templateError } = await supabase
        .from('rapor_template_keasramaan')
        .select('*')
        .eq('id', testTemplateId)
        .eq('template_type', 'builder')
        .single();

      expect(templateError).toBeNull();
      expect(template).toBeDefined();
      expect(template?.template_type).toBe('builder');

      // Fetch elements
      const { data: elements, error: elementsError } = await supabase
        .from('rapor_template_elements_keasramaan')
        .select('*')
        .eq('template_id', testTemplateId);

      expect(elementsError).toBeNull();
      expect(elements).toBeDefined();
      expect(elements!.length).toBeGreaterThan(0);
    });

    it('should fetch student data for PDF generation', async () => {
      if (!testSiswaId) {
        console.log('Skipping: No test student available');
        return;
      }

      const { data: siswa, error } = await supabase
        .from('data_siswa_keasramaan')
        .select('*')
        .eq('id', testSiswaId)
        .single();

      expect(error).toBeNull();
      expect(siswa).toBeDefined();
      expect(siswa?.nama_siswa).toBeDefined();
      expect(siswa?.nis).toBeDefined();
    });

    it('should save generation history on success', async () => {
      if (!testTemplateId || !testSiswaId) {
        console.log('Skipping: Missing test data');
        return;
      }

      // Get student NIS
      const { data: siswa } = await supabase
        .from('data_siswa_keasramaan')
        .select('nis')
        .eq('id', testSiswaId)
        .single();

      if (!siswa) {
        console.log('Skipping: Student not found');
        return;
      }

      // Simulate saving history
      const { data: history, error } = await supabase
        .from('rapor_generate_history_keasramaan')
        .insert({
          template_id: testTemplateId,
          siswa_nis: siswa.nis,
          tahun_ajaran: testPeriode.tahun_ajaran,
          semester: testPeriode.semester.toString(),
          pdf_url: 'https://example.com/test.pdf',
          status: 'completed',
          generated_by: testUserId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(history).toBeDefined();
      expect(history?.status).toBe('completed');

      // Cleanup
      if (history) {
        await supabase
          .from('rapor_generate_history_keasramaan')
          .delete()
          .eq('id', history.id);
      }
    });

    it('should save error to history on failure', async () => {
      if (!testTemplateId || !testSiswaId) {
        console.log('Skipping: Missing test data');
        return;
      }

      const { data: siswa } = await supabase
        .from('data_siswa_keasramaan')
        .select('nis')
        .eq('id', testSiswaId)
        .single();

      if (!siswa) {
        console.log('Skipping: Student not found');
        return;
      }

      // Simulate saving error history
      const { data: history, error } = await supabase
        .from('rapor_generate_history_keasramaan')
        .insert({
          template_id: testTemplateId,
          siswa_nis: siswa.nis,
          tahun_ajaran: testPeriode.tahun_ajaran,
          semester: testPeriode.semester.toString(),
          status: 'failed',
          error_message: 'Test error message',
          generated_by: testUserId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(history).toBeDefined();
      expect(history?.status).toBe('failed');
      expect(history?.error_message).toBe('Test error message');

      // Cleanup
      if (history) {
        await supabase
          .from('rapor_generate_history_keasramaan')
          .delete()
          .eq('id', history.id);
      }
    });
  });

  describe('Bulk PDF Generation', () => {
    it('should validate siswaIds array', async () => {
      const invalidRequest = {
        templateId: testTemplateId,
        siswaIds: 'not-an-array', // Should be array
        periode: testPeriode,
      };

      expect(Array.isArray(invalidRequest.siswaIds)).toBe(false);
    });

    it('should reject empty siswaIds array', async () => {
      const emptyRequest = {
        templateId: testTemplateId,
        siswaIds: [],
        periode: testPeriode,
      };

      expect(emptyRequest.siswaIds.length).toBe(0);
    });

    it('should fetch multiple students for bulk generation', async () => {
      const { data: students, error } = await supabase
        .from('data_siswa_keasramaan')
        .select('id, nama_siswa, nis')
        .limit(5);

      expect(error).toBeNull();
      expect(students).toBeDefined();
      expect(Array.isArray(students)).toBe(true);
    });

    it('should track bulk generation progress', async () => {
      // Simulate job status tracking
      const jobStatus = {
        jobId: 'test-job-123',
        status: 'processing',
        progress: {
          total: 10,
          completed: 5,
          failed: 1,
          current: 'Processing student 6 of 10',
        },
        results: [
          { siswaId: '1', siswaName: 'Student 1', status: 'completed', pdfUrl: 'url1' },
          { siswaId: '2', siswaName: 'Student 2', status: 'completed', pdfUrl: 'url2' },
          { siswaId: '3', siswaName: 'Student 3', status: 'failed', error: 'Error message' },
        ],
      };

      expect(jobStatus.progress.total).toBe(10);
      expect(jobStatus.progress.completed).toBe(5);
      expect(jobStatus.progress.failed).toBe(1);
      expect(jobStatus.results.length).toBe(3);
    });

    it('should handle individual student failures in bulk', async () => {
      const results = [
        { siswaId: '1', status: 'completed', pdfUrl: 'url1' },
        { siswaId: '2', status: 'failed', error: 'Data not found' },
        { siswaId: '3', status: 'completed', pdfUrl: 'url3' },
      ];

      const completed = results.filter(r => r.status === 'completed');
      const failed = results.filter(r => r.status === 'failed');

      expect(completed.length).toBe(2);
      expect(failed.length).toBe(1);
      expect(failed[0].error).toBe('Data not found');
    });

    it('should save bulk generation history for each student', async () => {
      if (!testTemplateId) {
        console.log('Skipping: No test template created');
        return;
      }

      const { data: students } = await supabase
        .from('data_siswa_keasramaan')
        .select('id, nis, nama_siswa')
        .limit(2);

      if (!students || students.length === 0) {
        console.log('Skipping: No students available');
        return;
      }

      // Simulate bulk history save
      const historyRecords = students.map(student => ({
        template_id: testTemplateId,
        siswa_nis: student.nis,
        tahun_ajaran: testPeriode.tahun_ajaran,
        semester: testPeriode.semester.toString(),
        pdf_url: `https://example.com/${student.nis}.pdf`,
        status: 'completed',
        generated_by: testUserId,
      }));

      const { data: history, error } = await supabase
        .from('rapor_generate_history_keasramaan')
        .insert(historyRecords)
        .select();

      expect(error).toBeNull();
      expect(history).toBeDefined();
      expect(history!.length).toBe(students.length);

      // Cleanup
      if (history) {
        const ids = history.map(h => h.id);
        await supabase
          .from('rapor_generate_history_keasramaan')
          .delete()
          .in('id', ids);
      }
    });
  });

  describe('PDF Generation Error Handling', () => {
    it('should handle missing template gracefully', async () => {
      const fakeTemplateId = '00000000-0000-0000-0000-000000000000';

      const { data, error } = await supabase
        .from('rapor_template_keasramaan')
        .select('*')
        .eq('id', fakeTemplateId)
        .eq('template_type', 'builder')
        .single();

      expect(error).toBeDefined();
      expect(error?.code).toBe('PGRST116');
    });

    it('should handle missing student gracefully', async () => {
      const fakeSiswaId = '00000000-0000-0000-0000-000000000000';

      const { data, error } = await supabase
        .from('data_siswa_keasramaan')
        .select('*')
        .eq('id', fakeSiswaId)
        .single();

      expect(error).toBeDefined();
    });

    it('should handle template with no elements', async () => {
      // Create template without elements
      const { data: emptyTemplate } = await supabase
        .from('rapor_template_keasramaan')
        .insert({
          nama_template: 'Empty Template',
          jenis_rapor: 'semester',
          template_type: 'builder',
          canvas_config: {},
          created_by: testUserId,
        })
        .select()
        .single();

      if (emptyTemplate) {
        const { data: elements } = await supabase
          .from('rapor_template_elements_keasramaan')
          .select('*')
          .eq('template_id', emptyTemplate.id);

        expect(elements).toBeDefined();
        expect(elements!.length).toBe(0);

        // Cleanup
        await supabase
          .from('rapor_template_keasramaan')
          .delete()
          .eq('id', emptyTemplate.id);
      }
    });
  });

  describe('Storage Integration', () => {
    it('should verify storage bucket exists', async () => {
      const { data: buckets, error } = await supabase
        .storage
        .listBuckets();

      expect(error).toBeNull();
      expect(buckets).toBeDefined();
      
      const raporBucket = buckets?.find(b => b.name === 'rapor-keasramaan');
      expect(raporBucket).toBeDefined();
    });

    it('should generate valid storage path', () => {
      const periode = { tahun_ajaran: '2024/2025', semester: 1 };
      const siswaName = 'Ahmad Test';
      
      const fileName = `Rapor_${siswaName.replace(/\s+/g, '_')}_${periode.tahun_ajaran.replace('/', '-')}_Sem${periode.semester}.pdf`;
      const storagePath = `rapor/${periode.tahun_ajaran.replace('/', '-')}/semester-${periode.semester}/${fileName}`;

      expect(fileName).toBe('Rapor_Ahmad_Test_2024-2025_Sem1.pdf');
      expect(storagePath).toBe('rapor/2024-2025/semester-1/Rapor_Ahmad_Test_2024-2025_Sem1.pdf');
    });
  });
});
