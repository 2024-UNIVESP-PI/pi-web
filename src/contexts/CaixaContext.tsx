import React, {
  Dispatch,
  SetStateAction,
  ReactNode,
  createContext,
  useState,
  useEffect,
} from "react";

import { Caixa } from "../services/caixaService";
import caixaService from "../services/caixaService";
import useLocalStorage from "../hooks/useLocalStorage";

type CaixaContextType = {
  caixa: number | undefined;
  setCaixa: Dispatch<SetStateAction<number | undefined>>;
  caixaData: Caixa | undefined;
  setCaixaData: Dispatch<SetStateAction<Caixa | undefined>>;
  hasChecked: boolean;
  setHasChecked: Dispatch<SetStateAction<boolean>>;
  isLoggedIn: boolean;
  login: (usuario: string, senha: string) => Promise<boolean>;
  logout: () => void;
};

type CaixaProviderType = {
  children: ReactNode | ReactNode[];
};

export const CaixaContext = createContext<CaixaContextType | undefined>(
  undefined
);

export const CaixaProvider = (props: CaixaProviderType) => {
  const [caixa, setCaixa] = useState<number>();
  const [caixaData, setCaixaData] = useState<Caixa>();
  const [hasChecked, setHasChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [storedCaixaId, setStoredCaixaId, deleteStoredCaixaId] =
    useLocalStorage<number | undefined>("caixa_logged_id", undefined);

  // Verificar se há caixa logado ao carregar - APENAS UMA VEZ
  // Usa uma ref para garantir que não execute novamente após logout
  const hasInitialized = React.useRef(false);
  const isLoggingOut = React.useRef(false);

  useEffect(() => {
    // Só executa uma vez na montagem inicial
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // Se estiver fazendo logout, não executa
    if (isLoggingOut.current) {
      setHasChecked(true);
      setIsLoggedIn(false);
      setCaixaData(undefined);
      setCaixa(undefined);
      return;
    }

    if (storedCaixaId) {
      caixaService
        .getCaixa(storedCaixaId)
        .then((response) => {
          // Só define se não estiver fazendo logout
          if (!isLoggingOut.current) {
            setCaixa(response.data.id);
            setCaixaData(response.data);
            setIsLoggedIn(true);
            setHasChecked(true);
          }
        })
        .catch(() => {
          // Se não conseguir carregar, limpa o storage
          if (!isLoggingOut.current) {
            deleteStoredCaixaId();
            setIsLoggedIn(false);
            setCaixaData(undefined);
            setCaixa(undefined);
            setHasChecked(true);
          }
        });
    } else {
      setHasChecked(true);
      setIsLoggedIn(false);
      setCaixaData(undefined);
      setCaixa(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez ao montar o componente

  // Garantir que quando isLoggedIn for false, os dados sejam SEMPRE limpos
  // Este useEffect tem prioridade sobre qualquer outro que tente definir dados
  useEffect(() => {
    // Só limpa se:
    // 1. Não estiver logado
    // 2. Já tiver verificado (hasChecked === true) - evita limpar durante a inicialização
    // 3. Não estiver fazendo logout (para evitar limpar durante o processo de logout)
    if (!isLoggedIn && hasChecked && !isLoggingOut.current) {
      // Se não estiver logado e já tiver verificado, limpa os dados
      setCaixa(undefined);
      setCaixaData(undefined);

      // Garante que o localStorage também esteja limpo
      // Executa de forma síncrona para evitar race conditions
      try {
        localStorage.removeItem("caixa_logged_id");
        localStorage.removeItem("caixa");
      } catch {
        // Ignora erros
      }

      // Se storedCaixaId ainda existir, força a limpeza
      // Isso previne que o useLocalStorage recarregue o valor do localStorage
      if (storedCaixaId !== undefined && storedCaixaId !== null) {
        deleteStoredCaixaId();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, hasChecked]); // Depende de isLoggedIn e hasChecked

  // Garantir que quando storedCaixaId for undefined ou removido, limpe os dados
  useEffect(() => {
    // Se estiver fazendo logout, não executa
    if (isLoggingOut.current) {
      return;
    }

    if (!storedCaixaId && isLoggedIn) {
      // Se storedCaixaId foi removido mas ainda está logado, desloga
      setCaixa(undefined);
      setCaixaData(undefined);
      setIsLoggedIn(false);
    }
  }, [storedCaixaId, isLoggedIn]);

  const login = async (usuario: string, senha: string): Promise<boolean> => {
    try {
      // Garante que não está fazendo logout durante o login
      isLoggingOut.current = false;

      const response = await caixaService.loginCaixa({ usuario, senha });
      if (response.status === 200) {
        const caixaLogado = response.data;
        // Define os dados antes de atualizar o localStorage
        setCaixa(caixaLogado.id);
        setCaixaData(caixaLogado);
        setStoredCaixaId(caixaLogado.id);
        setIsLoggedIn(true);
        setHasChecked(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false;
    }
  };

  const logout = () => {
    // Marca que está fazendo logout para prevenir que outros useEffects executem
    isLoggingOut.current = true;

    // IMPORTANTE: Ordem das operações - primeiro limpa o localStorage, depois os estados
    // Limpa o localStorage PRIMEIRO de forma síncrona e FORÇA a limpeza
    try {
      // Remove diretamente do localStorage
      localStorage.removeItem("caixa_logged_id");
      localStorage.removeItem("caixa");
      // Força a remoção novamente para garantir
      if (localStorage.getItem("caixa_logged_id")) {
        localStorage.removeItem("caixa_logged_id");
      }
      if (localStorage.getItem("caixa")) {
        localStorage.removeItem("caixa");
      }
    } catch {
      // Ignora erros de localStorage
    }

    // Usa deleteLocalStorage para garantir que o estado do hook também seja limpo
    // Chama múltiplas vezes para garantir que funcione
    deleteStoredCaixaId();
    setStoredCaixaId(undefined);
    deleteStoredCaixaId();

    // Limpa todos os estados de forma síncrona
    setCaixa(undefined);
    setCaixaData(undefined);

    // Define isLoggedIn como false ANTES de setHasChecked
    // Isso garante que o useEffect de limpeza seja acionado imediatamente
    setIsLoggedIn(false);

    // Por último, garante que hasChecked seja true para evitar estados intermediários
    setHasChecked(true);

    // Reseta a flag após um delay maior para garantir que todos os useEffects tenham sido processados
    setTimeout(() => {
      isLoggingOut.current = false;
      // Verificação final - se ainda houver algo no localStorage, limpa novamente
      try {
        if (localStorage.getItem("caixa_logged_id")) {
          localStorage.removeItem("caixa_logged_id");
          deleteStoredCaixaId();
        }
      } catch {
        // Ignora erros
      }
    }, 300);
  };

  return (
    <CaixaContext.Provider
      value={{
        caixa,
        setCaixa,
        caixaData,
        setCaixaData,
        hasChecked,
        setHasChecked,
        isLoggedIn,
        login,
        logout,
      }}
    >
      {props.children}
    </CaixaContext.Provider>
  );
};

export default {
  Context: CaixaContext,
  Provider: CaixaProvider,
};
