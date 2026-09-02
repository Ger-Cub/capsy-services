// Allow importing image assets in TypeScript
declare module '*.avif';
declare module '*.bmp';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.webp';

// Vite's import.meta.glob and env helpers (basic typing to satisfy tsc during dev)
interface ImportMeta {
  env: Record<string, any>;
  glob: (pattern: string, options?: any) => Record<string, string> | Record<string, { [k: string]: any }>;
  globEager?: (pattern: string, options?: any) => Record<string, any>;
}
