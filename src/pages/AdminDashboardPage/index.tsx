import { VendaPorCategoria, TopProduto } from "../../hooks/useDashboard";
import useDashboard from "../../hooks/useDashboard";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./styles.scss";
import Papa from "papaparse";

function exportCSVGeneric<T>(
  data: T[],
  filename: string,
  columns: { label: string; key: keyof T }[]
) {
  const mapped = data.map((item) =>
    columns.reduce((obj, col) => {
      obj[col.label] = item[col.key];
      return obj;
    }, {} as Record<string, unknown>)
  );

  const csv = Papa.unparse(mapped);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.click();
}

const COLORS = ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"];

export default function AdminDashboardPage() {
  const { data, loading } = useDashboard();

  if (loading) return <p>Carregando...</p>;
  if (!data) return <p>Erro ao carregar dados</p>;

  const {
    totalVendas,
    receita,
    clientesAtivos,
    vendasPorHorario,
    vendasPorCategoria,
    topProdutos,
    vendasDetalhadas,
  } = data;

  // Formatar vendasPorHorario para array para o gráfico
  const vendasPorHorarioData = Object.entries(vendasPorHorario).map(
    ([horario, vendas]) => ({
      horario,
      vendas,
    })
  );

  return (
    <div id="admin-dashboard-page">
      <div className="export-buttons">
        <button
          onClick={() =>
            exportCSVGeneric(
              vendasPorHorarioData,
              "vendas-por-horario.csv",
              [
                { label: "Horário", key: "horario" },
                { label: "Vendas", key: "vendas" },
              ]
            )
          }
        >
          Exportar Vendas por Horário
        </button>

        <button
          onClick={() =>
            exportCSVGeneric(
              vendasPorCategoria,
              "vendas-por-categoria.csv",
              [
                { label: "Categoria", key: "name" },
                { label: "Valor", key: "value" },
              ]
            )
          }
        >
          Exportar Vendas por Categoria
        </button>

        <button
          onClick={() =>
            exportCSVGeneric(
              topProdutos,
              "top-produtos.csv",
              [
                { label: "Produto", key: "nome" },
                { label: "Vendidos", key: "vendidos" },
              ]
            )
          }
        >
          Exportar Top Produtos
        </button>

        <button
          onClick={() =>
            exportCSVGeneric(
              vendasDetalhadas,
              "vendas-detalhadas.csv",
              [
                { label: "ID", key: "id" },
                { label: "Horário", key: "horario" },
                { label: "Produto", key: "produto" },
                { label: "Categoria", key: "categoria" },
                { label: "Quantidade", key: "quantidade" },
                { label: "Valor Total", key: "valorTotal" },
              ]
            )
          }
        >
          Exportar Vendas Detalhadas
        </button>
      </div>

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
        <div className="card grafico-horario" style={{ width: "100%", height: 300 }}>
          <h2>Vendas por Horário</h2>
          <ResponsiveContainer>
            <LineChart
              data={vendasPorHorarioData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="horario" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="vendas"
                stroke="#007bff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
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
              {vendasPorCategoria.map((_: VendaPorCategoria, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
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
          {topProdutos.map(({ nome, vendidos }: TopProduto, index: number) => (
            <li key={nome}>
              <span className="nome">{index === 0 ? "👑 " : ""}{nome}</span>
              <span className="vendidos">{vendidos} vendidos</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}