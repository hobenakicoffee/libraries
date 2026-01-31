export const Visibility = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export type Visibility = (typeof Visibility)[keyof typeof Visibility];
