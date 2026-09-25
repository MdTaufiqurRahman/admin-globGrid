import { useEffect } from "react";

const APP_NAME = "GlobaGRID Admin";

/** Names the browser tab after the page: "Categories · GlobaGRID Admin". */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
