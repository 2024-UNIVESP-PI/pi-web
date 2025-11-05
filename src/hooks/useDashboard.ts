import { useEffect, useState } from "react";
import dashboardService from "../services/dashboardService";

export interface VendaPorCategoria {
  name: string;
  value: number;
}

export interface TopProduto {
  nome: string;
  vendidos: number;
}

export interface VendaDetalhada {
  id: string;
  horario: string;
  data?: string;
  hora?: string;
  caixa_id?: number;
  caixa_nome?: string;
  caixa_usuario?: string;
  ficha_id?: number;
  ficha_numero?: string;
  ficha_saldo?: number;
  produto_id?: number;
  produto: string;
  produto_nome?: string;
  produto_categoria?: string;
  produto_preco?: number;
  categoria?: string;
  quantidade: number;
  valorTotal: number;
}

export interface ProdutoEstoquePrevisao {
  produto: string;
  estoque_atual: number;
  estoque_recomendado: number;
  media_diaria: number;
  necessita_reposicao: boolean;
}

export interface ProdutoRiscoEstoque {
  produto: string;
  estoque_atual: number;
  dias_restantes: number;
  demanda_media: number;
}

export interface HorarioPico {
  horario: string;
  vendas: number;
}

export interface TendenciaVendas {
  dias: string[];
  vendas: number[];
  receita: number[];
}

export interface ReservaML {
  total_pendentes: number;
  total_finalizadas: number;
  taxa_conversao: number;
  produtos_mais_reservados: Array<{
    produto: string;
    total_reservas: number;
  }>;
  tendencia_7dias: Array<{
    data: string;
    pendentes: number;
    finalizadas: number;
  }>;
}

export interface DashboardData {
  totalVendas: number;
  receita: number;
  clientesAtivos: number;
  ticketMedio: number;
  crescimentoPercentual: number;
  vendasPorHorario: Record<string, number>;
  vendasPorCategoria: VendaPorCategoria[];
  topProdutos: TopProduto[];
  vendasDetalhadas: VendaDetalhada[];
  // Predições ML
  predicaoDemanda: Record<string, number>;
  predicaoReceita3Dias: number;
  produtosEstoquePrevisao: ProdutoEstoquePrevisao[];
  produtosRiscoEstoque: ProdutoRiscoEstoque[];
  horariosPico: HorarioPico[];
  tendenciaVendas: TendenciaVendas;
  reservas: ReservaML;
}

export default function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    dashboardService
      .getDashboardData()
      .then((res) => {
        if (res && res.data) {
          setData(res.data);
        } else {
          setError(new Error("Resposta inválida da API"));
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar dashboard:", err);
        setError(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
