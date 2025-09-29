import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ContactInfo } from '@/utility/report-api';
import * as ImagePicker from 'expo-image-picker';

const DRAFT_STORAGE_KEY = '@report_draft';
const DRAFT_MAX_AGE_DAYS = 7;

export interface ReportDraftData {
  description: string;
  contact: ContactInfo;
  files: Array<{
    uri: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
  }>;
  savedAt: number;
}

interface ReportDraftContextType {
  hasDraft: boolean;
  isConnected: boolean;
  shouldShowNotification: boolean;
  saveDraft: (data: ReportDraftData) => Promise<void>;
  loadDraft: () => Promise<ReportDraftData | null>;
  clearDraft: () => Promise<void>;
  checkForDraft: () => Promise<boolean>;
}

const ReportDraftContext = createContext<ReportDraftContextType | undefined>(undefined);

export function ReportDraftProvider({ children }: { children: React.ReactNode }) {
  const [hasDraft, setHasDraft] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Check if we should show the notification (has draft AND connected)
  const shouldShowNotification = hasDraft && isConnected;

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  // Check for existing draft on mount
  useEffect(() => {
    checkForDraft();
  }, []);

  const checkForDraft = useCallback(async (): Promise<boolean> => {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftJson) {
        setHasDraft(false);
        return false;
      }

      const draft: ReportDraftData = JSON.parse(draftJson);

      // Check if draft is too old (> 7 days)
      const age = Date.now() - draft.savedAt;
      const maxAge = DRAFT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

      if (age > maxAge) {
        // Draft is stale, remove it
        await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasDraft(false);
        return false;
      }

      // Check if draft has any content
      const hasContent =
        draft.description.trim().length > 0 ||
        draft.files.length > 0 ||
        draft.contact.firstName.trim().length > 0 ||
        draft.contact.lastName.trim().length > 0 ||
        draft.contact.email.trim().length > 0 ||
        draft.contact.phone.trim().length > 0;

      setHasDraft(hasContent);
      return hasContent;
    } catch (error) {
      console.error('Error checking for draft:', error);
      setHasDraft(false);
      return false;
    }
  }, []);

  const saveDraft = useCallback(async (data: ReportDraftData): Promise<void> => {
    try {
      // Check if draft has any content worth saving
      const hasContent =
        data.description.trim().length > 0 ||
        data.files.length > 0 ||
        data.contact.firstName.trim().length > 0 ||
        data.contact.lastName.trim().length > 0 ||
        data.contact.email.trim().length > 0 ||
        data.contact.phone.trim().length > 0;

      if (!hasContent) {
        // No content to save, remove draft if it exists
        await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasDraft(false);
        return;
      }

      const draftData: ReportDraftData = {
        ...data,
        savedAt: Date.now(),
      };

      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setHasDraft(true);
      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, []);

  const loadDraft = useCallback(async (): Promise<ReportDraftData | null> => {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftJson) {
        return null;
      }

      const draft: ReportDraftData = JSON.parse(draftJson);

      // Check if draft is too old
      const age = Date.now() - draft.savedAt;
      const maxAge = DRAFT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

      if (age > maxAge) {
        await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasDraft(false);
        return null;
      }

      console.log('Draft loaded successfully');
      return draft;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }, []);

  const clearDraft = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraft(false);
      console.log('Draft cleared successfully');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, []);

  return (
    <ReportDraftContext.Provider
      value={{
        hasDraft,
        isConnected,
        shouldShowNotification,
        saveDraft,
        loadDraft,
        clearDraft,
        checkForDraft,
      }}
    >
      {children}
    </ReportDraftContext.Provider>
  );
}

export function useReportDraft() {
  const context = useContext(ReportDraftContext);
  if (context === undefined) {
    throw new Error('useReportDraft must be used within a ReportDraftProvider');
  }
  return context;
}