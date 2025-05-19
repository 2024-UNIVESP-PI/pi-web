// import { useAdmin } from "../../contexts/AdminContext"
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
  // const { logout } = useAdmin()

  const topProdutos = [
    { id: 1, nome: "Produto A", vendidos: 120 },
    { id: 2, nome: "Produto B", vendidos: 98 },
    { id: 3, nome: "Produto C", vendidos: 75 },
    { id: 4, nome: "Produto D", vendidos: 50 },
  ]

  const vendasPorDia = [
    { dia: "Seg", vendas: 20 },
    { dia: "Ter", vendas: 35 },
    { dia: "Qua", vendas: 40 },
    { dia: "Qui", vendas: 25 },
    { dia: "Sex", vendas: 50 },
    { dia: "Sab", vendas: 30 },
    { dia: "Dom", vendas: 45 },
  ]

  // Dados para gráfico de pizza (vendas por categoria)
  const vendasPorCategoria = [
    { name: "Eletrônicos", value: 400 },
    { name: "Roupas", value: 300 },
    { name: "Alimentos", value: 300 },
    { name: "Livros", value: 200 },
    { name: "Outros", value: 100 },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"]

  return (
    <div id="admin-dashboard-page">
      {/* <header>
        <h1>Admin Dashboard</h1>
      </header> */}

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

      <section className="vendas-por-dia card">
        <h2>Vendas por Dia</h2>
        <div className="bar-chart">
          {vendasPorDia.map(({ dia, vendas }) => (
            <div key={dia} className="bar-container">
              <div
                className="bar"
                style={{ height: `${vendas * 2}px` }}
                title={`${vendas} vendas`}
              ></div>
              <span className="label">{dia}</span>
            </div>
          ))}
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

      <section className="vendas-por-categoria card">
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
      </section>
    </div>
  )
}