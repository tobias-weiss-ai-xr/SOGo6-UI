import { formatDate } from '../list-item-utils'

describe('list-item-utils', () => {
  describe('formatDate', () => {
    const now = new Date()

    it('should format date as "Xm" for times less than 1 hour ago today when no translator', () => {
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
      const result = formatDate(fiveMinutesAgo.toISOString())
      expect(result).toMatch(/^\d+m$/)
    })

    it("should format today's time in a time format", () => {
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      const result = formatDate(twoHoursAgo.toISOString(), 'en-US')
      expect(result).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/)
    })

    it('should format dates from this week as day name', () => {
      // Use a fixed reference date to ensure deterministic "this week" calculation
      // Wednesday Jan 8 2025, going back to Monday Jan 6 2025 (same week)
      const refDate = new Date(2025, 0, 8) // Wed Jan 8
      const realDateConstructor = Date
      jest.spyOn(global, 'Date').mockImplementation(function (
        this: any,
        ...args: any[]
      ) {
        if (args.length === 0) return refDate
        return new (Function.prototype.bind.apply(realDateConstructor, [
          null,
          ...args,
        ]) as any)()
      })
      const mondayThisWeek = new Date(2025, 0, 6) // Mon Jan 6
      const result = formatDate(mondayThisWeek.toISOString(), 'en-US')
      expect(['Monday']).toContain(result)
      jest.restoreAllMocks()
    })

    it('should format dates from previous years as "MMM D, YYYY"', () => {
      const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      const result = formatDate(lastYear.toISOString(), 'en-US')
      // Should contain month, day, and year separated by spaces and comma
      expect(result).toMatch(/^[A-Z][a-z]{2}\s\d{1,2},\s\d{4}$/)
    })

    it('should format dates from this year as "MMM D"', () => {
      // Use a reference date in late November, checking a date from January same year
      const mockNow = new Date(now.getFullYear(), 10, 8) // November 8 of current year
      const realDateConstructor = Date
      jest.spyOn(global, 'Date').mockImplementation(function (
        this: any,
        ...args: any[]
      ) {
        if (args.length === 0) {
          return mockNow
        }
        return new (Function.prototype.bind.apply(realDateConstructor, [
          null,
          ...args,
        ]) as any)()
      })

      // January 8 of the same year — clearly outside current week
      const sameYear = new Date(now.getFullYear(), 0, 8)
      const result = formatDate(sameYear.toISOString(), 'en-US')
      expect(result).toMatch(/^[A-Z][a-z]{2}\s\d{1,2}$/)
      jest.restoreAllMocks()
    })

    it('should handle leap year dates correctly', () => {
      const leapYearDate = new Date(2024, 1, 29) // Feb 29, 2024
      expect(() => formatDate(leapYearDate.toISOString())).not.toThrow()
    })

    it('should handle edge case of exactly 1 hour ago', () => {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const result = formatDate(oneHourAgo.toISOString(), 'en-US')
      // Should be formatted as time, not as "60 min ago"
      expect(result).toMatch(/^\d{1,2}:\d{2}/)
    })

    it('should handle future dates gracefully', () => {
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      expect(() => formatDate(futureDate.toISOString())).not.toThrow()
    })
  })
})
