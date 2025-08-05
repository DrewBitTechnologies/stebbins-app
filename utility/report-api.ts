import * as ImagePicker from 'expo-image-picker';

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ReportData {
  description: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export const uploadFile = async (
  file: ImagePicker.ImagePickerAsset,
  API_BASE_URL: string,
  BEARER_TOKEN: string,
  REPORT_FILES_FOLDER_ID: string
): Promise<string> => {
  const formData = new FormData();
  
  const fileName = file.fileName || `upload_${Date.now()}.${file.mimeType?.split('/')[1] || 'jpg'}`;
  const mimeType = file.mimeType || 'application/octet-stream';
  
  formData.append('folder', REPORT_FILES_FOLDER_ID);

  formData.append('file', {
    uri: file.uri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await fetch(`${API_BASE_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`File upload failed: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  return json.data.id;
};

export const createReport = async (
  reportData: {
    description: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  },
  API_BASE_URL: string,
  BEARER_TOKEN: string
): Promise<number> => {
  const payload: ReportData = {
    description: reportData.description,
    first_name: reportData.firstName,
    last_name: reportData.lastName,
    email: reportData.email,
    phone_number: reportData.phone,
  };

  const response = await fetch(`${API_BASE_URL}/items/report`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Report creation failed: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  return json.data.id;
};

export const linkFileToReport = async (
  reportId: number,
  fileId: string,
  API_BASE_URL: string,
  BEARER_TOKEN: string
): Promise<void> => {
  const linkData = {
    report_id: reportId,
    directus_files_id: fileId,
  };

  const response = await fetch(`${API_BASE_URL}/items/report_files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(linkData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`File linking failed: ${response.status} - ${errorText}`);
  }
};

export const submitCompleteReport = async (
  files: ImagePicker.ImagePickerAsset[],
  reportData: {
    description: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  },
  API_BASE_URL: string,
  BEARER_TOKEN: string,
  REPORT_FILES_FOLDER_ID: string,
  onProgress?: (message: string) => void
): Promise<{ reportId: number; fileCount: number }> => {
  onProgress?.(`Starting submission with ${files.length} files...`);
  
  // Step 1: Upload all files and get their IDs
  const fileIds: string[] = [];
  if (files.length > 0) {
    onProgress?.('Uploading files...');
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.(`Uploading file ${i + 1}/${files.length}: ${file.fileName}`);
      const fileId = await uploadFile(file, API_BASE_URL, BEARER_TOKEN, REPORT_FILES_FOLDER_ID);
      fileIds.push(fileId);
    }
    onProgress?.('All files uploaded successfully');
  }

  // Step 2: Create the report
  onProgress?.('Creating report...');
  const reportId = await createReport(reportData, API_BASE_URL, BEARER_TOKEN);

  // Step 3: Link files to report
  if (fileIds.length > 0) {
    onProgress?.('Linking files to report...');
    for (const fileId of fileIds) {
      await linkFileToReport(reportId, fileId, API_BASE_URL, BEARER_TOKEN);
    }
    onProgress?.('All files linked successfully');
  }

  return { reportId, fileCount: fileIds.length };
};