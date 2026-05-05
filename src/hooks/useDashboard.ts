import { useEffect, useState } from "react";
import dashboardService from "../services/dashboardService";
import { toNumber } from "../functions/formatters";

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
  confianca?: number;
}

export interface ProdutoRiscoEstoque {
  produto: string;
  estoque_atual: number;
  dias_restantes: number;
  demanda_media: number;
  confianca?: number;
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
  confiancaPredicoes: {
    demanda: number;
    receita: number;
  };
  reservas: ReservaML;
}

const emptyTendencia: TendenciaVendas = {
  dias: [],
  vendas: [],
  receita: [],
};

const emptyReservas: ReservaML = {
  total_pendentes: 0,
  total_finalizadas: 0,
  taxa_conversao: 0,
  produtos_mais_reservados: [],
  tendencia_7dias: [],
};

function normalizeDashboardData(raw: Partial<DashboardData>): DashboardData {
  return {
    totalVendas: toNumber(raw.totalVendas),
    receita: toNumber(raw.receita),
    clientesAtivos: toNumber(raw.clientesAtivos),
    ticketMedio: toNumber(raw.ticketMedio),
    crescimentoPercentual: toNumber(raw.crescimentoPercentual),
    vendasPorHorario: raw.vendasPorHorario || {},
    vendasPorCategoria: Array.isArray(raw.vendasPorCategoria)
      ? raw.vendasPorCategoria
      : [],
    topProdutos: Array.isArray(raw.topProdutos) ? raw.topProdutos : [],
    vendasDetalhadas: Array.isArray(raw.vendasDetalhadas)
      ? raw.vendasDetalhadas
      : [],
    predicaoDemanda: raw.predicaoDemanda || {},
    predicaoReceita3Dias: toNumber(raw.predicaoReceita3Dias),
    produtosEstoquePrevisao: Array.isArray(raw.produtosEstoquePrevisao)
      ? raw.produtosEstoquePrevisao
      : [],
    produtosRiscoEstoque: Array.isArray(raw.produtosRiscoEstoque)
      ? raw.produtosRiscoEstoque
      : [],
    horariosPico: Array.isArray(raw.horariosPico) ? raw.horariosPico : [],
    tendenciaVendas: raw.tendenciaVendas || emptyTendencia,
    confiancaPredicoes: {
      demanda: toNumber(raw.confiancaPredicoes?.demanda),
      receita: toNumber(raw.confiancaPredicoes?.receita),
    },
    reservas: raw.reservas || emptyReservas,
  };
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
          setData(normalizeDashboardData(res.data));
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
