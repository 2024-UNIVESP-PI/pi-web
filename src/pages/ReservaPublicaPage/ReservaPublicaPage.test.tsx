import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ReservaPublicaPage from "./index";

const { getProdutosReserva, criarReservaPublica } = vi.hoisted(() => ({
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
  criarReservaPublica: vi.fn().mockResolvedValue({
    reservas: [
      {
        id: 1,
        produto: "Produto A",
        quantidade: 1,
        preco_unitario: 10,
        preco_total: 10,
      },
    ],
    total: 10,
    nome_completo: "Pessoa Teste",
    cpf: "12345678901",
    data_reserva: "2026-11-02T12:00:00Z",
    consulta_token: "consulta-token",
  }),
}));

vi.mock("../../services/reservaService", () => ({
  default: {
    getProdutosReserva,
    criarReservaPublica,
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
    expect(screen.getByLabelText(/nome completo/i)).toHaveAttribute(
      "autocomplete",
      "name"
    );
    expect(screen.getByLabelText(/^cpf/i)).toHaveAttribute(
      "inputmode",
      "numeric"
    );
  });

  it("announces invalid CPF and associates the message with the field", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    );
    const cpf = screen.getByLabelText(/^cpf/i);
    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: "Pessoa Teste" },
    });
    fireEvent.change(cpf, { target: { value: "123" } });
    fireEvent.submit(
      screen.getByRole("button", { name: /confirmar reserva/i }).closest("form")!
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/11 dígitos/i);
    expect(cpf).toHaveAttribute("aria-invalid", "true");
    expect(cpf).toHaveAttribute("aria-describedby", "reserva-error");
  });

  it("completes the public reservation journey and shows its receipt", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /aumentar quantidade/i }));
    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: "Pessoa Teste" },
    });
    fireEvent.change(screen.getByLabelText(/^cpf/i), {
      target: { value: "12345678901" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /confirmar reserva/i }).closest("form")!
    );

    expect(await screen.findByRole("heading", { name: /reserva confirmada/i })).toBeInTheDocument();
    expect(criarReservaPublica).toHaveBeenCalledWith({
      nome_completo: "Pessoa Teste",
      cpf: "12345678901",
      produtos: [{ produto_id: 1, quantidade: 1 }],
      qr_code: "test123",
    });
  });
});
