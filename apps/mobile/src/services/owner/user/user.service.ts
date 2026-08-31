import { User } from '@food_delivery/types';
import { api } from '@/lib/axios';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const userService = {
  // ─── UPDATE PROFILE ───
  updateProfile: async (data: UpdateProfilePayload): Promise<User> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  // ─── UPLOAD PROFILE IMAGE ───
  // Handles both Expo ImagePicker assets (uri, mimeType, fileName) and generic {uri, type, name}
  uploadProfileImage: async (image: any): Promise<User> => {
    if (!image?.uri) {
      throw new Error('Invalid image: missing uri');
    }
    const formData = new FormData();
    const fileType = image.mimeType || image.type || 'image/jpeg';
    const fileName =
      image.fileName || image.name || `profile_${Date.now()}.jpg`;
    formData.append('image', {
      uri: image.uri,
      type: fileType,
      name: fileName,
    } as any);

    const response = await api.post('/users/profile/image', formData, {
      headers: { 'Content-Type': undefined } as any,
      transformRequest: (d) => d,
    });
    return response.data;
  },

  // ─── DELETE PROFILE IMAGE ───
  deleteProfileImage: async (): Promise<User> => {
    const response = await api.delete('/users/profile/image');
    return response.data;
  },

  // ─── GET CURRENT USER (optional, for refresh) ───
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },
};