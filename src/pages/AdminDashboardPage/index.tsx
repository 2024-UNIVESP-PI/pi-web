import useDashboard from "../../hooks/useDashboard"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import "./styles.scss"

export default function AdminDashboardPage() {

  const { data, loading } = useDashboard()

  if (loading) return <p>Carregando...</p>
  if (!data) return <p>Erro ao carregar dados</p>

  const {
    totalVendas,
    receita,
    clientesAtivos,
    vendasPorHorario,
    vendasPorCategoria,
    topProdutos
  } = data

  const COLORS = ["#f39c12", "#e67e22", "#3498db", "#9b59b6", "#95a5a6"]
  
  return (
    <div id="admin-dashboard-page">
      <section className="overview">
        <div className="card">
          <h3>Total Vendas</h3>
          <p className="number">{totalVendas}</p>
        </div>
        <div className="card">
          <h3>Receita</h3>
          <p className="number">R$ {Number(receita).toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Clientes Ativos</h3>
          <p className="number">{clientesAtivos}</p>
        </div>
      </section>

      <section className="graficos">
        <div className="card grafico-horario">
          <h2>Vendas por Horário</h2>
          <div className="bar-chart">
            {Object.entries(vendasPorHorario).map(([horario, vendas]) => (
              <div key={horario} className="bar-container">
                <div
                  className="bar"
                  style={{ height: `${vendas as number * 2}px` }}
                  title={`${vendas} vendas`}
                ></div>
                <span className="label">{horario}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card grafico-categoria">
          <h2>Vendas por Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vendasPorCategoria}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {vendasPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="top-produtos card">
        <h2>Top Produtos Mais Vendidos</h2>
        <ul>
          {topProdutos.map(({ nome, vendidos }) => (
            <li key={nome}>
              <span className="nome">{nome}</span>
              <span className="vendidos">{vendidos} vendidos</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}