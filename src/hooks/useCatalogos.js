import { useCallback, useEffect, useState } from "react";
import { listCatalogos, errorText } from "../services/catalogos";

/* categorias === null → a carregar. Em caso de erro usa `fallback` (ou lista vazia). */
export default function useCatalogos({ fallback } = {}) {
  const [categorias, setCategorias] = useState(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setCategorias(await listCatalogos());
      setError("");
    } catch (err) {
      setError(errorText(err));
      setCategorias((prev) => prev ?? fallback ?? []);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { reload(); }, [reload]);
  return { categorias, error, reload, loading: categorias === null };
}
