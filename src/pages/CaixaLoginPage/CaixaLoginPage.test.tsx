import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CaixaContext } from "../../contexts/CaixaContext";
import { describe, expect, it, vi } from "vitest";
import CaixaLoginPage from "./index";

const mockCaixaContextValue = {
  caixa: undefined,
  setCaixa: vi.fn(),
  caixaData: undefined,
  setCaixaData: vi.fn(),
  hasChecked: true,
  setHasChecked: vi.fn(),
  isLoggedIn: false,
  login: vi.fn().mockResolvedValue(false),
  logout: vi.fn(),
};

const mockAdminContextValue = {
  isAdmin: false,
  login: vi.fn().mockResolvedValue(false),
  logout: vi.fn(),
};

vi.mock("../../contexts/AdminContext", () => ({
  useAdmin: () => mockAdminContextValue,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <CaixaContext.Provider value={mockCaixaContextValue}>
        <CaixaLoginPage />
      </CaixaContext.Provider>
    </MemoryRouter>
  );
}

describe("CaixaLoginPage a11y", () => {
  it("has accessible label for Usuário input", () => {
    renderPage();
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
  });

  it("has accessible label for Senha input", () => {
    renderPage();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("has submit button with accessible name", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("announces invalid credentials and restores the submit state", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/usuário/i), {
      target: { value: "caixa" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "senha" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /usuário ou senha inválidos/i
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /entrar/i })).not.toBeDisabled()
    );
  });
});
