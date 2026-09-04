import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getApiErrorMessage } from './api-error';

/**
 * Persist + share (or download on web) a CSV string.
 * Uses the new expo-file-system (v57) File/Paths API.
 * @returns true if the file was shared/downloaded successfully.
 */
export const saveAndShareCsv = async (
  csv: string,
  fileName: string,
): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web: trigger a browser download via a Blob + anchor.
      const blob = new Blob([`\uFEFF${csv}`], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    }

    const file = new File(Paths.cache, fileName);
    if (file.exists) {
      file.delete();
    }
    file.write(`\uFEFF${csv}`);

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    await Sharing.shareAsync(file.uri, {
      dialogTitle: fileName,
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
    });
    return true;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Could not export the file');
    throw new Error(message);
  }
};
