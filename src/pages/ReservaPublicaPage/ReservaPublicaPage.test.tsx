import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ReservaPublicaPage from "./index";

vi.mock("../../services/reservaService", () => ({
  default: {
    getProdutosReserva: vi.fn().mockResolvedValue({
      qr_code: "test123",
      descricao: "Evento Teste",
      produtos: [
        {
          id: 1,
          nome: "Produto A",
          preco: 10.0,
          limite_reserva: 3,
          disponivel: 5,
          reservado: 0,
          quantidade_reserva_disponivel: 3,
          categoria: "Bebida",
        },
      ],
    }),
    criarReservaPublica: vi.fn(),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/reserva/test123"]}>
      <Routes>
        <Route path="/reserva/:qrCode" element={<ReservaPublicaPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ReservaPublicaPage a11y", () => {
  it("shows loading indicator initially", () => {
    renderPage();
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it("renders quantity buttons with accessible names after load", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    );
    const buttons = screen.getAllByRole("button", { name: /diminuir|aumentar/i });
    expect(buttons.length).toBeGreaterThan(0);
  });
});
