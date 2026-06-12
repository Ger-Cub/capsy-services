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
