import { useEffect, useState } from "react"
import dashboardService from "../services/dashboardService"

export interface VendaPorCategoria {
  name: string
  value: number
}

export interface TopProduto {
  nome: string
  vendidos: number
}

export interface VendaDetalhada {
  id: string           
  horario: string      
  produto: string      
  categoria?: string  
  quantidade: number    
  valorTotal: number   
}

export interface DashboardData {
  totalVendas: number
  receita: number
  clientesAtivos: number
  vendasPorHorario: Record<string, number>
  vendasPorCategoria: VendaPorCategoria[]
  topProdutos: TopProduto[]
  vendasDetalhadas: VendaDetalhada[]
}

export default function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    setLoading(true)
    dashboardService.getDashboardData()
      .then(res => setData(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}