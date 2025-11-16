import { parseAsString, createLoader } from "nuqs/server";

export const sandboxSearchParams = {
  sandbox: parseAsString,
};

export const loadSandboxSearchParams = createLoader(sandboxSearchParams);
