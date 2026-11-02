import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it } from "vitest";
import api from ".";
import {
  AUTH_TOKEN_STORAGE_KEY,
  CAIXA_LOGGED_ID_STORAGE_KEY,
  getStoredAdminSession,
} from "../contexts/authStorage";

const response = (config: InternalAxiosRequestConfig) => ({
  data: {},
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});

afterEach(() => {
  localStorage.clear();
  api.defaults.adapter = undefined;
});

describe("API authentication", () => {
  it("sends the stored signed token as a Bearer credential", async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "short-token");
    let requestConfig: InternalAxiosRequestConfig | undefined;
    api.defaults.adapter = async (config) => {
      requestConfig = config;
      return response(config);
    };

    await api.get("protected/");

    expect(requestConfig?.headers.Authorization).toBe("Bearer short-token");
  });

  it("clears local sessions after an unauthorized response", async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "expired-token");
    localStorage.setItem(CAIXA_LOGGED_ID_STORAGE_KEY, "3");
    localStorage.setItem("adminLoggedIn", "true");
    api.defaults.adapter = async (config) => {
      throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config,
        data: {},
      });
    };

    await expect(api.get("protected/")).rejects.toBeInstanceOf(axios.AxiosError);

    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(CAIXA_LOGGED_ID_STORAGE_KEY)).toBeNull();
    expect(getStoredAdminSession()).toBe(false);
  });
});
