import { useEffect, useContext } from "react";
import { VendaPorCategoria } from "../../hooks/useDashboard";
import useDashboard from "../../hooks/useDashboard";
import CaixaContext from "../../contexts/CaixaContext";
import {
  formatCurrency,
  formatDecimal,
  formatInteger,
  formatShortDate,
} from "../../functions/formatters";
import {
  FaBoxOpen,
  FaChartColumn,
  FaChartLine,
  FaClock,
  FaDownload,
  FaFileCsv,
  FaSackDollar,
  FaTicket,
  FaTriangleExclamation,
  FaTrophy,
  FaUsers,
  FaClipboardList,
} from "react-icons/fa6";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
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
  const { data, loading, error } = useDashboard();
  const caixaContext = useContext(CaixaContext.Context);

  // Desloga o caixa quando o admin acessa a dashboard
  useEffect(() => {
    if (caixaContext?.isLoggedIn) {
      caixaContext.logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez ao montar a página

  if (loading) {
    return (
      <div id="admin-dashboard-page">
        <div className="dashboard-state">
          <span className="state-icon">
            <FaChartLine />
          </span>
          <strong>Carregando dashboard</strong>
          <p>Buscando vendas, estoque e reservas.</p>
        </div>
      </div>
    );
  }

  if (!data || data === null || data === undefined) {
    return (
      <div id="admin-dashboard-page">
        <div className="dashboard-state error">
          <span className="state-icon">
            <FaTriangleExclamation />
          </span>
          <strong>Erro ao carregar dados</strong>
          <p>
            {error
              ? "A API respondeu com erro. Tente recarregar a página."
              : "Não foi possível montar os dados do dashboard."}
          </p>
        </div>
      </div>
    );
  }

  const {
    totalVendas,
    receita,
    clientesAtivos,
    ticketMedio,
    crescimentoPercentual,
    vendasPorHorario,
    vendasPorCategoria,
    topProdutos,
    vendasDetalhadas,
    predicaoDemanda,
    predicaoReceita3Dias,
    produtosEstoquePrevisao,
    produtosRiscoEstoque,
    horariosPico,
    tendenciaVendas,
    confiancaPredicoes,
    reservas,
  } = data;

  // Formatar vendasPorHorario para array para o gráfico
  const vendasPorHorarioData = Object.entries(vendasPorHorario || {}).map(
    ([horario, vendas]) => ({
      horario,
      vendas,
      predicao: (predicaoDemanda && predicaoDemanda[horario]) || null,
    })
  );

  // Dados para gráfico de tendência
  const tendenciaData =
    tendenciaVendas && tendenciaVendas.dias && tendenciaVendas.dias.length > 0
      ? tendenciaVendas.dias.map((dia, index) => ({
          dia: formatShortDate(dia),
          vendas: tendenciaVendas.vendas[index] || 0,
          receita: tendenciaVendas.receita[index] || 0,
        }))
      : [
          // Dados padrão quando não há histórico (últimos 7 dias com zeros)
          ...Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
              dia: formatShortDate(date.toISOString()),
              vendas: 0,
              receita: 0,
            };
          }),
        ];

  return (
    <div id="admin-dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Vendas, estoque e reservas em tempo real</p>
      </div>

      <div className="export-buttons">
        <div className="export-title">
          <FaDownload />
          <span>Exportações</span>
        </div>
        <button
          onClick={() =>
            exportCSVGeneric(vendasPorHorarioData, "vendas-por-horario.csv", [
              { label: "Horário", key: "horario" },
              { label: "Vendas", key: "vendas" },
            ])
          }
        >
          <FaFileCsv />
          Exportar Vendas por Horário
        </button>

        <button
          onClick={() =>
            exportCSVGeneric(vendasPorCategoria, "vendas-por-categoria.csv", [
              { label: "Categoria", key: "name" },
              { label: "Valor", key: "value" },
            ])
          }
        >
          <FaFileCsv />
          Exportar Vendas por Categoria
        </button>

        <button
          onClick={() =>
            exportCSVGeneric(topProdutos, "top-produtos.csv", [
              { label: "Produto", key: "nome" },
              { label: "Vendidos", key: "vendidos" },
            ])
          }
        >
          <FaFileCsv />
          Exportar Top Produtos
        </button>

        <button
          onClick={() =>
            exportCSVGeneric(vendasDetalhadas, "vendas-detalhadas.csv", [
              { label: "ID", key: "id" },
              { label: "Horário", key: "horario" },
              { label: "Produto", key: "produto" },
              { label: "Categoria", key: "categoria" },
              { label: "Quantidade", key: "quantidade" },
              { label: "Valor Total", key: "valorTotal" },
            ])
          }
        >
          <FaFileCsv />
          Exportar Vendas Detalhadas
        </button>

        {predicaoDemanda && Object.keys(predicaoDemanda).length > 0 && (
          <button
            onClick={() =>
              exportCSVGeneric(
                Object.entries(predicaoDemanda || {}).map(
                  ([horario, predicao]) => ({
                    horario,
                    predicao,
                  })
                ),
                "predicao-demanda.csv",
                [
                  { label: "Horário", key: "horario" },
                  { label: "Predição", key: "predicao" },
                ]
              )
            }
          >
            <FaFileCsv />
            Exportar Predições de Demanda
          </button>
        )}

        {produtosEstoquePrevisao && produtosEstoquePrevisao.length > 0 && (
          <button
            onClick={() =>
              exportCSVGeneric(
                produtosEstoquePrevisao,
                "previsao-estoque.csv",
                [
                  { label: "Produto", key: "produto" },
                  { label: "Estoque Atual", key: "estoque_atual" },
                  { label: "Média Diária", key: "media_diaria" },
                  { label: "Estoque Recomendado", key: "estoque_recomendado" },
                  { label: "Necessita Reposição", key: "necessita_reposicao" },
                ]
              )
            }
          >
            <FaFileCsv />
            Exportar Previsão de Estoque
          </button>
        )}

        {vendasDetalhadas && vendasDetalhadas.length > 0 && (
          <button
            onClick={() =>
              exportCSVGeneric(vendasDetalhadas, "vendas-completas.csv", [
                { label: "ID Venda", key: "id" },
                { label: "Data", key: "data" },
                { label: "Hora", key: "hora" },
                { label: "ID Caixa", key: "caixa_id" },
                { label: "Nome Caixa", key: "caixa_nome" },
                { label: "Usuário Caixa", key: "caixa_usuario" },
                { label: "ID Ficha", key: "ficha_id" },
                { label: "Número Ficha", key: "ficha_numero" },
                { label: "Saldo Ficha", key: "ficha_saldo" },
                { label: "ID Produto", key: "produto_id" },
                { label: "Nome Produto", key: "produto_nome" },
                { label: "Categoria Produto", key: "produto_categoria" },
                { label: "Preço Unitário", key: "produto_preco" },
                { label: "Quantidade", key: "quantidade" },
                { label: "Valor Total", key: "valorTotal" },
              ])
            }
            className="primary-export"
          >
            <FaFileCsv />
            Exportar Todas as Vendas
          </button>
        )}
      </div>

      <section className="overview">
        <div className="card">
          <h3>
            Total Vendas
            <span
              className="card-icon"
              style={{ background: "var(--color-primary-light)" }}
            >
              <FaChartColumn />
            </span>
          </h3>
          <p className="number">{formatInteger(totalVendas)}</p>
          {crescimentoPercentual !== 0 && (
            <p
              className={`indicator ${
                crescimentoPercentual > 0 ? "positive" : "negative"
              }`}
            >
              {crescimentoPercentual > 0 ? "↑" : "↓"}{" "}
              {formatDecimal(Math.abs(crescimentoPercentual), 1)}%
              {crescimentoPercentual > 0
                ? " vs período anterior"
                : " vs período anterior"}
            </p>
          )}
        </div>
        <div className="card">
          <h3>
            Receita Total
            <span
              className="card-icon"
              style={{ background: "var(--color-success-light)" }}
            >
              <FaSackDollar />
            </span>
          </h3>
          <p className="number">{formatCurrency(receita)}</p>
          {predicaoReceita3Dias > 0 && (
            <p className="prediction">
              Previsão 3 dias: {formatCurrency(predicaoReceita3Dias)}
              <span>
                Confiança {formatDecimal(confiancaPredicoes.receita * 100, 0)}%
              </span>
            </p>
          )}
        </div>
        <div className="card">
          <h3>
            Clientes Ativos
            <span
              className="card-icon"
              style={{ background: "var(--color-info-light)" }}
            >
              <FaUsers />
            </span>
          </h3>
          <p className="number">{formatInteger(clientesAtivos)}</p>
        </div>
        <div className="card">
          <h3>
            Ticket Médio
            <span
              className="card-icon"
              style={{ background: "var(--color-warning-light)" }}
            >
              <FaTicket />
            </span>
          </h3>
          <p className="number">{formatCurrency(ticketMedio)}</p>
        </div>
      </section>

      <section className="graficos">
        <div className="card grafico-tendencia">
          <h2>
            <FaChartLine />
            Tendência de Vendas
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={tendenciaData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007bff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#007bff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28a745" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#28a745" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="vendas"
                stroke="#007bff"
                fillOpacity={1}
                fill="url(#colorVendas)"
                name="Vendas"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="receita"
                stroke="#28a745"
                fillOpacity={1}
                fill="url(#colorReceita)"
                name="Receita (R$)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card grafico-horario">
          <h2>
            <FaClock />
            Vendas por Horário
            <span className="model-confidence">
              Confiança {formatDecimal(confiancaPredicoes.demanda * 100, 0)}%
            </span>
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart
              data={vendasPorHorarioData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="horario"
                tick={{ fill: "#64748b", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                label={{
                  value: "Número de Vendas",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#475569",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                dataKey="vendas"
                fill="#2563eb"
                name="Vendas Reais"
                radius={[4, 4, 0, 0]}
              />
              {predicaoDemanda && Object.keys(predicaoDemanda).length > 0 && (
                <Line
                  type="monotone"
                  dataKey="predicao"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Predição ML"
                  dot={{
                    fill: "#f59e0b",
                    r: 5,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 7 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="graficos-grid">
          <div className="card grafico-categoria">
            <h2>
              <FaBoxOpen />
              Vendas por Categoria
            </h2>
            {vendasPorCategoria && vendasPorCategoria.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2rem",
                  flexWrap: "wrap",
                }}
              >
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={vendasPorCategoria}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={40}
                      fill="#8884d8"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {vendasPorCategoria.map((_: VendaPorCategoria, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: number) => [
                        `${value} unidades`,
                        "Quantidade",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ minWidth: "200px" }}>
                  <h3
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--color-text-medium)",
                      marginBottom: "1rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Detalhes por Categoria
                  </h3>
                  <div className="category-detail-list">
                    {vendasPorCategoria.map((categoria, index) => (
                      <div
                        key={index}
                        className="category-detail-item"
                      >
                        <div
                          className="category-swatch"
                          style={{ background: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <div className="category-name">
                            {categoria.name.replace(/^[^\s]+\s/, "")}
                          </div>
                          <div className="category-value">
                            {formatInteger(categoria.value)} unidades
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "var(--color-text-medium)",
                }}
              >
                <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                  Nenhuma venda registrada ainda
                </p>
                <p style={{ fontSize: "0.875rem" }}>
                  As categorias aparecerão aqui quando houver vendas
                </p>
              </div>
            )}
          </div>

          <div className="card grafico-top-produtos">
            <h2>
              <FaTrophy />
              Top Produtos Mais Vendidos
            </h2>
            {topProdutos && topProdutos.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={topProdutos}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    label={{
                      value: "Quantidade Vendida",
                      position: "insideBottom",
                      offset: -5,
                      fill: "#475569",
                    }}
                  />
                  <YAxis
                    dataKey="nome"
                    type="category"
                    width={120}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="vendidos"
                    fill="#2563eb"
                    name="Vendidos"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "var(--color-text-medium)",
                }}
              >
                <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                  Nenhum produto vendido ainda
                </p>
                <p style={{ fontSize: "0.875rem" }}>
                  Os produtos mais vendidos aparecerão aqui quando houver vendas
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {produtosRiscoEstoque && produtosRiscoEstoque.length > 0 && (
        <section className="card alertas-estoque">
          <h2>
            <FaTriangleExclamation />
            Alertas de Estoque
          </h2>
          <div className="produtos-risco">
            {produtosRiscoEstoque.map((produto, index) => (
              <div key={index} className="produto-risco-item">
                <div className="produto-info">
                  <strong>{produto.produto}</strong>
                  <span className="dias-restantes">
                    {produto.dias_restantes} dias restantes
                  </span>
                </div>
                <div className="estoque-info">
                  <span>Estoque: {produto.estoque_atual}</span>
                  <span>Demanda média: {produto.demanda_media}/dia</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {produtosEstoquePrevisao && produtosEstoquePrevisao.length > 0 && (
        <section className="card previsao-estoque">
          <h2>
            <FaChartColumn />
            Previsão de Estoque Necessário
          </h2>
          <div className="table-container">
            <table className="estoque-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Estoque Atual</th>
                  <th>Média Diária</th>
                  <th>Estoque Recomendado</th>
                  <th>Confiança</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {produtosEstoquePrevisao.map((produto, index) => (
                  <tr key={index}>
                    <td>{produto.produto}</td>
                    <td>{produto.estoque_atual}</td>
                    <td>{produto.media_diaria}</td>
                    <td>{produto.estoque_recomendado}</td>
                    <td>{formatDecimal((produto.confianca || 0) * 100, 0)}%</td>
                    <td>
                      <span
                        className={`status-badge ${
                          produto.necessita_reposicao ? "warning" : "ok"
                        }`}
                      >
                        {produto.necessita_reposicao ? "Reposição" : "OK"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {horariosPico && horariosPico.length > 0 && (
        <section className="card horarios-pico">
          <h2>
            <FaClock />
            Horários de Pico
          </h2>
          <div className="pico-list">
            {horariosPico.map((pico, index) => (
              <div key={index} className="pico-item">
                <span className="pico-rank">#{index + 1}</span>
                <span className="pico-horario">{pico.horario}</span>
                <span className="pico-vendas">{pico.vendas} vendas</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dados de ML sobre Reservas */}
      {reservas && (
        <section className="reservas-ml card">
          <h2>
            <span className="card-icon">
              <FaClipboardList />
            </span>
            Análise de Reservas
          </h2>

          <div className="reservas-stats">
            <div className="stat-item">
              <span className="stat-label">Pendentes</span>
              <span className="stat-value">{reservas.total_pendentes}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Finalizadas</span>
              <span className="stat-value">{reservas.total_finalizadas}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Taxa de Conversão</span>
              <span className="stat-value">{reservas.taxa_conversao}%</span>
            </div>
          </div>

          {reservas.produtos_mais_reservados &&
            reservas.produtos_mais_reservados.length > 0 && (
              <div className="produtos-reservados">
                <h3>Produtos Mais Reservados</h3>
                <ul>
                  {reservas.produtos_mais_reservados.map((item, index) => (
                    <li key={index}>
                      <span className="produto-nome">{item.produto}</span>
                      <span className="produto-total">
                        {item.total_reservas} reservas
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {reservas.tendencia_7dias && reservas.tendencia_7dias.length > 0 && (
            <div className="tendencia-reservas">
              <h3>Tendência dos Últimos 7 Dias</h3>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={reservas.tendencia_7dias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="data"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    style={{ fontSize: "0.75rem" }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pendentes" fill="#f59e0b" name="Pendentes" />
                  <Bar
                    dataKey="finalizadas"
                    fill="#10b981"
                    name="Finalizadas"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
