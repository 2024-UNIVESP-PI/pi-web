import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
});
