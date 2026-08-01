import { describe, expect, it } from "vitest";
import {
  extractNumbersFromSpeech,
  parseCountPhrase,
  parseKeyboardTurn,
  parseSpokenTurn,
} from "./parseSpeech";

describe("extractNumbersFromSpeech", () => {
  it("parses digit and word numbers", () => {
    expect(extractNumbersFromSpeech("nine ten eleven")).toEqual([9, 10, 11]);
    expect(extractNumbersFromSpeech("1 2 3")).toEqual([1, 2, 3]);
    expect(extractNumbersFromSpeech("twenty one")).toEqual([21]);
  });
});

describe("parseCountPhrase", () => {
  it("parses count-only phrases", () => {
    expect(parseCountPhrase("two numbers")).toBe(2);
    expect(parseCountPhrase("say three")).toBe(3);
    expect(parseCountPhrase("1")).toBe(1);
  });
});

describe("parseSpokenTurn", () => {
  it("uses spoken number sequences when valid", () => {
    expect(parseSpokenTurn("nine", 8)).toBe(1);
    expect(parseSpokenTurn("nine ten", 8)).toBe(2);
    expect(parseSpokenTurn("nine ten eleven", 8)).toBe(3);
    expect(parseSpokenTurn("one two", 0)).toBe(2);
  });

  it("falls back to count phrases", () => {
    expect(parseSpokenTurn("two numbers", 0)).toBe(2);
    expect(parseSpokenTurn("say one", 5)).toBe(1);
  });

  it("rejects invalid sequences", () => {
    expect(parseSpokenTurn("ten eleven", 8)).toBeNull();
    expect(parseSpokenTurn("five", 8)).toBeNull();
  });
});

describe("parseKeyboardTurn", () => {
  it("maps keys to move counts", () => {
    expect(parseKeyboardTurn("1")).toBe(1);
    expect(parseKeyboardTurn("Digit2")).toBe(2);
    expect(parseKeyboardTurn("3")).toBe(3);
    expect(parseKeyboardTurn("a")).toBeNull();
  });
});
