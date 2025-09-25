declare module "react-native-image-manipulator" {
  export interface SaveOptions {
    format?: "jpeg" | "png" | "webp";
    compress?: number;
    base64?: boolean;
  }

  export interface Action {
    resize?: { width?: number; height?: number };
    rotate?: number;
    flip?: { vertical?: boolean; horizontal?: boolean };
    crop?: { originX: number; originY: number; width: number; height: number };
    brightness?: number; // tambahan custom
  }

  export function manipulateAsync(
    uri: string,
    actions: Action[],
    options?: SaveOptions
  ): Promise<{ uri: string; width: number; height: number; base64?: string }>;

  export const SaveFormat: {
    JPEG: "jpeg";
    PNG: "png";
    WEBP: "webp";
  };
}