import * as SecureStore from "expo-secure-store";
export const storage = {
  async getString(key: string) { return (await SecureStore.getItemAsync(key)) ?? null; },
  async setString(key: string, value: string) { await SecureStore.setItemAsync(key, value); },
  async delete(key: string) { await SecureStore.deleteItemAsync(key); }
};

