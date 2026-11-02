import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CaixaContext, { CaixaProvider } from "./CaixaContext";
import { AdminProvider, useAdmin } from "./AdminContext";
import { AUTH_TOKEN_STORAGE_KEY, CAIXA_LOGGED_ID_STORAGE_KEY } from "./authStorage";

const { loginCaixa, getCaixa, loginAdmin } = vi.hoisted(() => ({
  loginCaixa: vi.fn(),
  getCaixa: vi.fn(),
  loginAdmin: vi.fn(),
}));

vi.mock("../services/caixaService", () => ({
  default: { loginCaixa, getCaixa },
}));

vi.mock("../services/adminService", () => ({
  default: { loginAdmin },
}));

function CaixaJourney() {
  const context = useContext(CaixaContext.Context);
  if (!context) throw new Error("missing caixa provider");
  return (
    <>
      <output data-testid="status">{context.isLoggedIn ? "logged-in" : "logged-out"}</output>
      <button onClick={() => void context.login("caixa", "senha")}>Entrar</button>
    </>
  );
}

function AdminJourney() {
  const context = useAdmin();
  return (
    <>
      <output data-testid="admin-status">{context.isAdmin ? "logged-in" : "logged-out"}</output>
      <button onClick={() => void context.login("admin", "senha")}>Entrar admin</button>
    </>
  );
}

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("authenticated journeys", () => {
  it("logs a caixa in and persists the short bearer token and subject", async () => {
    loginCaixa.mockResolvedValue({
      status: 200,
      data: { token: "caixa-token", caixa: { id: 7, nome: "Caixa", usuario: "caixa" } },
    });
    getCaixa.mockResolvedValue({ data: { id: 7, nome: "Caixa", usuario: "caixa" } });

    render(
      <CaixaProvider>
        <CaixaJourney />
      </CaixaProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("logged-in"));
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe("caixa-token");
    expect(localStorage.getItem(CAIXA_LOGGED_ID_STORAGE_KEY)).toBe("7");
  });

  it("logs an admin in and persists the signed token", async () => {
    loginAdmin.mockResolvedValue({ status: 200, data: { token: "admin-token" } });
    render(
      <AdminProvider>
        <AdminJourney />
      </AdminProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Entrar admin" }));

    await waitFor(() => expect(screen.getByTestId("admin-status")).toHaveTextContent("logged-in"));
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe("admin-token");
  });
});
