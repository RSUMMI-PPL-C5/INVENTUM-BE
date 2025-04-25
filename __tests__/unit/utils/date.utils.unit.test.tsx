import { getJakartaTime, toJakartaDate } from "../../../src/utils/date.utils";

describe("Date Utils", () => {
  describe("getJakartaTime", () => {
    it("should return the current date and time in Jakarta timezone (UTC+7)", () => {
      const mockDate = new Date("2025-04-20T00:00:00Z"); // UTC time
      jest.useFakeTimers().setSystemTime(mockDate);

      const jakartaTime = getJakartaTime();

      expect(jakartaTime).toEqual(new Date("2025-04-20T07:00:00Z")); // UTC+7
      jest.useRealTimers();
    });

    it("should adjust time correctly across day boundaries", () => {
      const mockDate = new Date("2025-04-20T22:00:00Z"); // UTC time
      jest.useFakeTimers().setSystemTime(mockDate);

      const jakartaTime = getJakartaTime();

      expect(jakartaTime).toEqual(new Date("2025-04-21T05:00:00Z")); // Should be next day in Jakarta
      jest.useRealTimers();
    });
  });

  describe("toJakartaDate", () => {
    it("should return null for invalid date strings", () => {
      const result = toJakartaDate("invalid-date");
      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = toJakartaDate("");
      expect(result).toBeNull();
    });

    it("should convert a full ISO date string to Jakarta time", () => {
      const result = toJakartaDate("2025-04-20T12:00:00Z");
      expect(result).toEqual(new Date("2025-04-20T19:00:00Z")); // UTC+7
    });

    it("should convert a date-only string to the start of the day in Jakarta time", () => {
      const result = toJakartaDate("2025-04-20");
      expect(result).toEqual(new Date("2025-04-19T17:00:00Z")); // Start of the day in UTC+7
    });

    it("should convert a date-only string to the end of the day in Jakarta time when isEnd is true", () => {
      const result = toJakartaDate("2025-04-20", true);
      expect(result).toEqual(new Date("2025-04-20T16:59:59.999Z")); // End of the day in UTC+7
    });

    it("should handle a date string with time and apply UTC+7 offset", () => {
      const result = toJakartaDate("2025-04-20T10:00:00");
      expect(result).toEqual(new Date("2025-04-20T17:00:00")); // UTC+7
    });

    it("should handle date crossing month boundaries", () => {
      const result = toJakartaDate("2025-04-30");
      expect(result).toEqual(new Date("2025-04-29T17:00:00Z")); // Should be previous day
    });

    it("should handle date crossing year boundaries", () => {
      const result = toJakartaDate("2025-01-01");
      expect(result).toEqual(new Date("2024-12-31T17:00:00Z")); // Should be previous year
    });
  });
});
