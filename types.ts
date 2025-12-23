
export interface ImageState {
  original: string | null;
  edited: string | null;
}

export interface GenerationStatus {
  loading: boolean;
  error: string | null;
}
