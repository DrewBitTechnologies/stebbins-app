import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportScreen from '../../app/(tabs)/report';
import { ReportDraftProvider } from '../../contexts/report-draft';
import { ApiProvider } from '../../contexts/api';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');
jest.mock('expo-haptics');
jest.mock('expo-image-picker');
jest.mock('@/utility/report-api', () => ({
  submitCompleteReport: jest.fn().mockResolvedValue({ fileCount: 0 }),
}));

const DRAFT_STORAGE_KEY = '@report_draft';

describe('Report Screen - Draft Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());
  });

  const renderReportScreen = () => {
    return render(
      <ApiProvider>
        <ReportDraftProvider>
          <ReportScreen />
        </ReportDraftProvider>
      </ApiProvider>
    );
  };

  describe('Auto-save functionality', () => {
    it('should auto-save draft when description is entered', async () => {
      const { getByPlaceholderText } = renderReportScreen();

      const descriptionInput = getByPlaceholderText(/Describe the issue/i);

      await act(async () => {
        fireEvent.changeText(descriptionInput, 'Test issue description');
      });

      // Wait for debounced save (500ms)
      await waitFor(
        () => {
          expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            DRAFT_STORAGE_KEY,
            expect.stringContaining('Test issue description')
          );
        },
        { timeout: 1000 }
      );
    });
/*
    it('should auto-save draft when contact info is entered', async () => {
      const { getByPlaceholderText } = renderReportScreen();

      const firstNameInput = getByPlaceholderText(/First Name/i);

      await act(async () => {
        fireEvent.changeText(firstNameInput, 'John');
      });

      await waitFor(
        () => {
          expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            DRAFT_STORAGE_KEY,
            expect.stringContaining('John')
          );
        },
        { timeout: 1000 }
      );
    });

    it('should debounce save calls', async () => {
      const { getByPlaceholderText } = renderReportScreen();

      const descriptionInput = getByPlaceholderText(/Describe the issue/i);

      await act(async () => {
        fireEvent.changeText(descriptionInput, 'First');
        fireEvent.changeText(descriptionInput, 'Second');
        fireEvent.changeText(descriptionInput, 'Third');
      });

      // Wait for debounce
      await waitFor(
        () => {
          expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
        },
        { timeout: 1000 }
      );
    });*/
  });
/*
  describe('Load draft on mount', () => {
    it('should load existing draft when screen mounts', async () => {
      const mockDraft = {
        description: 'Loaded draft description',
        contact: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '1234567890',
        },
        files: [],
        savedAt: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockDraft));

      const { getByPlaceholderText, getByDisplayValue } = renderReportScreen();

      await waitFor(() => {
        expect(getByDisplayValue('Loaded draft description')).toBeTruthy();
        expect(getByDisplayValue('Jane')).toBeTruthy();
        expect(getByDisplayValue('Smith')).toBeTruthy();
        expect(getByDisplayValue('jane@example.com')).toBeTruthy();
      });
    });

    it('should not load stale draft older than 7 days', async () => {
      const staleDraft = {
        description: 'Old draft',
        contact: { firstName: '', lastName: '', email: '', phone: '' },
        files: [],
        savedAt: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(staleDraft));

      const { queryByDisplayValue } = renderReportScreen();

      await waitFor(() => {
        expect(queryByDisplayValue('Old draft')).toBeNull();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
      });
    });
  });

  describe('Clear draft functionality', () => {
    it('should show Clear Draft button when form has content', async () => {
      const { getByPlaceholderText, getByText } = renderReportScreen();

      const descriptionInput = getByPlaceholderText(/Describe the issue/i);

      await act(async () => {
        fireEvent.changeText(descriptionInput, 'Test content');
      });

      await waitFor(() => {
        expect(getByText('Clear Draft')).toBeTruthy();
      });
    });

    it('should clear draft when Clear Draft button is pressed', async () => {
      const { getByPlaceholderText, getByText, queryByDisplayValue } = renderReportScreen();

      const descriptionInput = getByPlaceholderText(/Describe the issue/i);

      await act(async () => {
        fireEvent.changeText(descriptionInput, 'Test content');
      });

      await waitFor(() => {
        expect(getByText('Clear Draft')).toBeTruthy();
      });

      // Mock Alert.alert to auto-confirm
      const Alert = require('react-native').Alert;
      Alert.alert = jest.fn((title, message, buttons) => {
        const clearButton = buttons?.find((btn: any) => btn.text === 'Clear');
        if (clearButton?.onPress) {
          clearButton.onPress();
        }
      });

      await act(async () => {
        fireEvent.press(getByText('Clear Draft'));
      });

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
        expect(queryByDisplayValue('Test content')).toBeNull();
      });
    });
  });

  describe('Submit functionality', () => {
    it('should clear draft after successful submission', async () => {
      const { getByPlaceholderText, getByText } = renderReportScreen();

      const descriptionInput = getByPlaceholderText(/Describe the issue/i);

      await act(async () => {
        fireEvent.changeText(descriptionInput, 'Issue to report');
      });

      // Wait for auto-save
      await waitFor(
        () => {
          expect(AsyncStorage.setItem).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      // Mock Alert.alert for success
      const Alert = require('react-native').Alert;
      Alert.alert = jest.fn((title, message, buttons) => {
        const okButton = buttons?.find((btn: any) => btn.text === 'OK');
        if (okButton?.onPress) {
          okButton.onPress();
        }
      });

      const submitButton = getByText('Submit Report');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
      });
    });

    it('should not clear draft if submission fails', async () => {
      const { submitCompleteReport } = require('@/utility/report-api');
      submitCompleteReport.mockRejectedValueOnce(new Error('Network error'));

      const { getByPlaceholderText, getByText } = renderReportScreen();

      const descriptionInput = getByPlaceholderText(/Describe the issue/i);

      await act(async () => {
        fireEvent.changeText(descriptionInput, 'Issue to report');
      });

      // Mock Alert.alert
      const Alert = require('react-native').Alert;
      Alert.alert = jest.fn();

      const submitButton = getByText('Submit Report');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          expect.stringContaining('Failed to submit report')
        );
      });

      // Draft should NOT be cleared
      expect(AsyncStorage.removeItem).not.toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
    });
  });

  describe('Empty form validation', () => {
    it('should not save draft for completely empty form', async () => {
      const { getByPlaceholderText } = renderReportScreen();

      const descriptionInput = getByPlaceholderText(/Describe the issue/i);

      await act(async () => {
        fireEvent.changeText(descriptionInput, '');
      });

      await waitFor(
        () => {
          expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
        },
        { timeout: 1000 }
      );
    });
  });*/
});