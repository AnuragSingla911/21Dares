import { describe, expect, it } from "vitest";
import { parseKeyboardTurn } from "./keyboard";

describe("parseKeyboardTurn", () => {
  it("maps keys to move counts", () => {
    expect(parseKeyboardTurn("1")).toBe(1);
    expect(parseKeyboardTurn("Digit2")).toBe(2);
    expect(parseKeyboardTurn("3")).toBe(3);
    expect(parseKeyboardTurn("a")).toBeNull();
  });
});
