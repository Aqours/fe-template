import { describe, expect, it } from "vitest";

import { formatGreeting } from "./index";

describe("formatGreeting", () => {
  it("formats the supplied name as a greeting", () => {
    expect(formatGreeting("Codex")).toBe("Hello, Codex!");
  });
});
