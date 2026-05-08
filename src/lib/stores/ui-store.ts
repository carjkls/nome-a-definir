'use client';

import { useMemo, useState } from 'react';

interface UIState {
  modais: Record<string, boolean>;
  filtros: Record<string, unknown>;
  configuracoes: {
    compactMode: boolean;
    animationsEnabled: boolean;
  };
  abrirModal: (nome: string) => void;
  fecharModal: (nome: string) => void;
  setFiltro: (pagina: string, filtros: unknown) => void;
  toggleCompact: () => void;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const initialState = {
  modais: {},
  filtros: {},
  configuracoes: {
    compactMode: false,
    animationsEnabled: true,
  },
};

export function useUIStore(): UIState {
  const [state, setState] = useState(initialState);

  return useMemo(
    () => ({
      ...state,
      abrirModal: (nome: string) =>
        setState((current) => ({
          ...current,
          modais: { ...current.modais, [nome]: true },
        })),
      fecharModal: (nome: string) =>
        setState((current) => ({
          ...current,
          modais: { ...current.modais, [nome]: false },
        })),
      setFiltro: (pagina: string, filtros: unknown) =>
        setState((current) => ({
          ...current,
          filtros: { ...current.filtros, [pagina]: filtros },
        })),
      toggleCompact: () =>
        setState((current) => ({
          ...current,
          configuracoes: {
            ...current.configuracoes,
            compactMode: !current.configuracoes.compactMode,
          },
        })),
      setAnimationsEnabled: (enabled: boolean) =>
        setState((current) => ({
          ...current,
          configuracoes: {
            ...current.configuracoes,
            animationsEnabled: enabled,
          },
        })),
    }),
    [state]
  );
}
