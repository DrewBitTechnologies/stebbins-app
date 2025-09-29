import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReportDraftProvider, useReportDraft, ReportDraftData } from '../../contexts/report-draft';
import NetInfo from '@react-native-community/netinfo';
import React, { ReactNode } from 'react';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock NetInfo
jest.mock('@react-native-community/netinfo');

const DRAFT_STORAGE_KEY = '@report_draft';

describe('Report Draft Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    // Mock NetInfo
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(ReportDraftProvider, null, children);

  describe('saveDraft', () => {
    it('should save draft to AsyncStorage when content exists', async () => {
      const { result } = renderHook(() => useReportDraft(), { wrapper });

      const draftData: ReportDraftData = {
        description: 'Test description',
        contact: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '1234567890' },
        files: [],
        savedAt: Date.now(),
      };

      await act(async () => {
        await result.current.saveDraft(draftData);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DRAFT_STORAGE_KEY,
        expect.stringContaining('Test description')
      );
    });

    it('should not save draft when content is empty', async () => {
      const { result } = renderHook(() => useReportDraft(), { wrapper });

      const emptyDraft: ReportDraftData = {
        description: '',
        contact: { firstName: '', lastName: '', email: '', phone: '' },
        files: [],
        savedAt: Date.now(),
      };

      await act(async () => {
        await result.current.saveDraft(emptyDraft);
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
    });

    it('should update hasDraft state when draft is saved', async () => {
      const { result } = renderHook(() => useReportDraft(), { wrapper });

      const draftData: ReportDraftData = {
        description: 'Test description',
        contact: { firstName: '', lastName: '', email: '', phone: '' },
        files: [],
        savedAt: Date.now(),
      };

      await act(async () => {
        await result.current.saveDraft(draftData);
      });

      await waitFor(() => {
        expect(result.current.hasDraft).toBe(true);
      });
    });
  });

  describe('loadDraft', () => {
    it('should load draft from AsyncStorage', async () => {
      const mockDraft: ReportDraftData = {
        description: 'Saved draft',
        contact: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '9876543210' },
        files: [],
        savedAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockDraft));

      const { result } = renderHook(() => useReportDraft(), { wrapper });

      let loadedDraft: ReportDraftData | null = null;
      await act(async () => {
        loadedDraft = await result.current.loadDraft();
      });

      expect(loadedDraft).toMatchObject({
        description: 'Saved draft',
        contact: { firstName: 'Jane', lastName: 'Smith' },
      });
    });

    it('should return null when no draft exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useReportDraft(), { wrapper });

      let loadedDraft: ReportDraftData | null = null;
      await act(async () => {
        loadedDraft = await result.current.loadDraft();
      });

      expect(loadedDraft).toBeNull();
    });

    it('should remove stale drafts older than 7 days', async () => {
      const sevenDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
      const staleDraft: ReportDraftData = {
        description: 'Old draft',
        contact: { firstName: '', lastName: '', email: '', phone: '' },
        files: [],
        savedAt: sevenDaysAgo,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(staleDraft));

      const { result } = renderHook(() => useReportDraft(), { wrapper });

      let loadedDraft: ReportDraftData | null = null;
      await act(async () => {
        loadedDraft = await result.current.loadDraft();
      });

      expect(loadedDraft).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
    });
  });

  describe('clearDraft', () => {
    it('should remove draft from AsyncStorage', async () => {
      const { result } = renderHook(() => useReportDraft(), { wrapper });

      await act(async () => {
        await result.current.clearDraft();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
    });

    it('should update hasDraft state to false', async () => {
      const { result } = renderHook(() => useReportDraft(), { wrapper });

      // First save a draft
      const draftData: ReportDraftData = {
        description: 'Test',
        contact: { firstName: '', lastName: '', email: '', phone: '' },
        files: [],
        savedAt: Date.now(),
      };

      await act(async () => {
        await result.current.saveDraft(draftData);
      });

      // Then clear it
      await act(async () => {
        await result.current.clearDraft();
      });

      await waitFor(() => {
        expect(result.current.hasDraft).toBe(false);
      });
    });
  });

  describe('checkForDraft', () => {
    it('should return true when valid draft exists', async () => {
      const mockDraft: ReportDraftData = {
        description: 'Test draft',
        contact: { firstName: '', lastName: '', email: '', phone: '' },
        files: [],
        savedAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockDraft));

      const { result } = renderHook(() => useReportDraft(), { wrapper });

      let hasDraft = false;
      await act(async () => {
        hasDraft = await result.current.checkForDraft();
      });

      expect(hasDraft).toBe(true);
    });

    it('should return false when draft is empty', async () => {
      const emptyDraft: ReportDraftData = {
        description: '',
        contact: { firstName: '', lastName: '', email: '', phone: '' },
        files: [],
        savedAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(emptyDraft));

      const { result } = renderHook(() => useReportDraft(), { wrapper });

      let hasDraft = false;
      await act(async () => {
        hasDraft = await result.current.checkForDraft();
      });

      expect(hasDraft).toBe(false);
    });
  });

  describe('shouldShowNotification', () => {
    it('should be true when draft exists and network is connected', async () => {
      const mockDraft: ReportDraftData = {
        description: 'Test draft',
        contact: { firstName: '', lastName: '', email: '', phone: '' },
        files: [],
        savedAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockDraft));
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      const { result } = renderHook(() => useReportDraft(), { wrapper });

      await act(async () => {
        await result.current.checkForDraft();
      });

      await waitFor(() => {
        expect(result.current.shouldShowNotification).toBe(true);
      });
    });

    it('should be false when draft exists but network is disconnected', async () => {
      const mockDraft: ReportDraftData = {
        description: 'Test draft',
        contact: { firstName: '', lastName: '', email: '', phone: '' },
        files: [],
        savedAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockDraft));
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const { result } = renderHook(() => useReportDraft(), { wrapper });

      await act(async () => {
        await result.current.checkForDraft();
      });

      await waitFor(() => {
        expect(result.current.shouldShowNotification).toBe(false);
      });
    });

    it('should be false when no draft exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      const { result } = renderHook(() => useReportDraft(), { wrapper });

      await waitFor(() => {
        expect(result.current.shouldShowNotification).toBe(false);
      });
    });
  });
});