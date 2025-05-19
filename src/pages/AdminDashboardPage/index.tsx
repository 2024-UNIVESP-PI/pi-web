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

  const topProdutos = [
    { id: 1, nome: "Produto A", vendidos: 120 },
    { id: 2, nome: "Produto B", vendidos: 98 },
    { id: 3, nome: "Produto C", vendidos: 75 },
    { id: 4, nome: "Produto D", vendidos: 50 },
  ]

  // Substitui vendas por dia por vendas por horário
  const vendasPorHorario = [
    { horario: "00h-06h", vendas: 5 },
    { horario: "06h-12h", vendas: 40 },
    { horario: "12h-18h", vendas: 70 },
    { horario: "18h-24h", vendas: 80 },
  ]

  const vendasPorCategoria = [
    { name: "🍬 Doces", value: 400 },
    { name: "🥨 Salgados", value: 300 },
    { name: "🍹 Bebidas", value: 300 },
    { name: "🎯 Jogos", value: 200 },
    { name: "🎉 Outros", value: 100 },
  ]
  
  const COLORS = ["#f39c12", "#e67e22", "#3498db", "#9b59b6", "#95a5a6"]

  return (
    <div id="admin-dashboard-page">
      <section className="overview">
        <div className="card">
          <h3>Total Vendas</h3>
          <p className="number">318</p>
        </div>
        <div className="card">
          <h3>Receita</h3>
          <p className="number">R$ 25.400,00</p>
        </div>
        <div className="card">
          <h3>Clientes Ativos</h3>
          <p className="number">85</p>
        </div>
      </section>

      <section className="graficos">
        <div className="card grafico-horario">
          <h2>Vendas por Horário</h2>
          <div className="bar-chart">
            {vendasPorHorario.map(({ horario, vendas }) => (
              <div key={horario} className="bar-container">
                <div
                  className="bar"
                  style={{ height: `${vendas * 2}px` }}
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
          {topProdutos.map(({ id, nome, vendidos }) => (
            <li key={id}>
              <span className="nome">{nome}</span>
              <span className="vendidos">{vendidos} vendidos</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}