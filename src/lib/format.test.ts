import { describe, expect, it } from "vitest";
import {
  clamp,
  comfortLabel,
  formatClock,
  formatDay,
  formatHour,
  formatPrecip,
  formatTemp,
  formatTempFull,
  formatWind,
  relativeTime,
} from "@/lib/format";

describe("formatTemp / formatTempFull", () => {
  it("rounds celsius", () => {
    expect(formatTemp(21.4, "c")).toBe("21°");
    expect(formatTemp(-0.4, "c")).toBe("0°");
  });

  it("converts to fahrenheit", () => {
    expect(formatTemp(0, "f")).toBe("32°");
    expect(formatTemp(100, "f")).toBe("212°");
    expect(formatTemp(21.4, "f")).toBe("71°");
  });

  it("appends the unit letter", () => {
    expect(formatTempFull(21.4, "c")).toBe("21°C");
    expect(formatTempFull(21.4, "f")).toBe("71°F");
  });
});

describe("formatWind", () => {
  it("keeps km/h for metric", () => {
    expect(formatWind(23.6, "c")).toBe("24 km/h");
  });

  it("converts to mph for imperial", () => {
    expect(formatWind(100, "f")).toBe("62 mph");
  });
});

describe("formatPrecip", () => {
  it("hides sub-millimetre drizzle as <1 mm", () => {
    expect(formatPrecip(0.4)).toBe("<1 mm");
  });

  it("shows one decimal below 10 mm and rounds above", () => {
    expect(formatPrecip(1.25)).toBe("1.3 mm");
    expect(formatPrecip(12.4)).toBe("12 mm");
  });
});

describe("time formatting", () => {
  it("formats an hour without minutes or a leading space", () => {
    expect(formatHour("2026-09-21T09:00")).toBe("9AM");
  });

  it("formats clock times with minutes", () => {
    expect(formatClock("2026-09-21T09:05")).toBe("9:05 AM");
  });

  it("formats short and long day labels", () => {
    expect(formatDay("2026-09-21", "short")).toBe("Mon");
    expect(formatDay("2026-09-21", "long")).toBe("Monday, Sep 21");
  });

  it("describes relative time buckets", () => {
    const now = Date.now();
    expect(relativeTime(now - 20_000)).toBe("just now");
    expect(relativeTime(now - 5 * 60_000)).toBe("5m ago");
    expect(relativeTime(now - 3 * 3600_000)).toBe("3h ago");
    expect(relativeTime(now - 2 * 86_400_000)).toBe("2d ago");
  });
});

describe("comfortLabel", () => {
  it("maps UV bands", () => {
    expect(comfortLabel(0)).toBe("Low");
    expect(comfortLabel(4)).toBe("Moderate");
    expect(comfortLabel(6)).toBe("High");
    expect(comfortLabel(9)).toBe("Very high");
    expect(comfortLabel(12)).toBe("Extreme");
  });
});

describe("clamp", () => {
  it("clamps to the bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});
