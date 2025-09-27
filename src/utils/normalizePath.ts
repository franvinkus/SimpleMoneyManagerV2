// utils/normalizePath.ts
import RNFS from "react-native-fs";

export async function normalizePath(uri: string): Promise<string> {
  if (uri.startsWith("file://")) {
    return uri; // sudah siap dipakai Skia
  }

  if (uri.startsWith("content://")) {
    // convert content:// jadi file:// dengan copy sementara
    const destPath = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpg`;
    await RNFS.copyFile(uri, destPath);
    return "file://" + destPath;
  }

  return "file://" + uri; // fallback kalau raw path
}
