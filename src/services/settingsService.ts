import { supabase } from '../lib/supabase';

export interface UserProfile {
  id?: number;
  full_name: string;
  email: string;
  role: string;
}

const TABLE_NAME = 'profiles';

export const settingsService = {
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Profile not found');
        }
        throw error;
      }

      return data as UserProfile;
    } catch (err) {
      console.warn('Error fetching profile:', err);
      throw err;
    }
  },

  async updateProfile(profile: UserProfile, userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        id: userId,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  }
};
