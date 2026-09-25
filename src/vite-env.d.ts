interface ImportMetaEnv {
  /** Base URL of the GlobaGRID API, without a trailing path. */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
