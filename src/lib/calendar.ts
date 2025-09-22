import {
  format,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  isBefore,
  isAfter,
  isEqual,
  fromUnixTime,
  getUnixTime,
  getHours,
  getMinutes,
  getSeconds,
  getDate,
  getDay,
  getMonth,
  getYear,
  setHours,
  setMinutes,
  setSeconds,
  setDate,
  setMonth,
  setYear,
} from "date-fns";

/**
 * Calendar utility functions for date and time formatting
 */

// Date formatting functions
export const formatDate = {
  /**
   * Format date as MM/DD/YYYY
   */
  short: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "MM/dd/yyyy");
  },

  /**
   * Format date as Month DD, YYYY
   */
  long: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  },

  /**
   * Format date as DD/MM/YYYY
   */
  european: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "dd/MM/yyyy");
  },

  /**
   * Format date as YYYY-MM-DD
   */
  iso: (date: Date | string): string | undefined => {
    if (!date) return undefined;
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isNaN(dateObj.getTime()) ? undefined : format(dateObj, "yyyy-MM-dd");
  },

  /**
   * Format date as abbreviated month and day (e.g., "Jan 15, 2024")
   */
  abbreviated: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  },

  /**
   * Format date with day of week (e.g., "Monday, January 15, 2024")
   */
  withDay: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "EEEE, MMMM dd, yyyy");
  },
};

// Time formatting functions
export const formatTime = {
  /**
   * Format time as HH:MM AM/PM
   */
  standard: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "h:mm a");
  },

  /**
   * Format time as HH:MM (24-hour format)
   */
  military: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "HH:mm");
  },

  /**
   * Format time with seconds (HH:MM:SS)
   */
  withSeconds: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "HH:mm:ss");
  },

  /**
   * Format time as HH:MM AM/PM with seconds
   */
  standardWithSeconds: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "h:mm:ss a");
  },
};

// DateTime formatting functions
export const formatDateTime = {
  /**
   * Format date and time as MM/DD/YYYY HH:MM AM/PM
   */
  standard: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "MM/dd/yyyy h:mm a");
  },

  /**
   * Format date and time as Month DD, YYYY at HH:MM AM/PM
   */
  long: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "MMMM dd, yyyy 'at' h:mm a");
  },

  /**
   * Format date and time as YYYY-MM-DD HH:MM:SS
   */
  iso: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "yyyy-MM-dd HH:mm:ss");
  },

  /**
   * Format date and time for display in lists
   */
  compact: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "MMM dd, h:mm a");
  },

  fromSecondsToReadable: (seconds: number): string => {
    if (!seconds) return "";
    const numyears = Math.floor(seconds / 31536000);
    const numdays = Math.floor((seconds % 31536000) / 86400);
    const numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    const numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    // const numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    let time = "";
    if (numyears) {
      time += numyears + ` year${numyears > 1 ? "s" : ""} `;
    }
    if (numdays) {
      time += numdays + ` day${numdays > 1 ? "s" : ""} `;
    }
    if (numhours) {
      time += numhours + ` hour${numhours > 1 ? "s" : ""} `;
    }
    if (numminutes) {
      time += numminutes + ` minute${numminutes > 1 ? "s" : ""} `;
    }
    // if (numseconds) {
    //   time += numseconds + " seconds";
    // }

    return time;
  },
};

// Relative time functions
export const formatRelativeTime = {
  /**
   * Get relative time (e.g., "2 hours ago", "in 3 days")
   */
  distance: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  },

  /**
   * Get relative time without suffix
   */
  distanceOnly: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(dateObj);
  },

  /**
   * Get relative time between two dates
   */
  between: (startDate: Date | string, endDate: Date | string): string => {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return formatDistance(start, end, { addSuffix: true });
  },

  /**
   * Get relative time from now (e.g., "yesterday at 2:30 PM")
   */
  fromNow: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatRelative(dateObj, new Date());
  },
};

// Date range functions
export const getDateRange = {
  /**
   * Get start and end of day
   */
  day: (date: Date | string) => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return {
      start: startOfDay(dateObj),
      end: endOfDay(dateObj),
    };
  },

  /**
   * Get start and end of week
   */
  week: (date: Date | string) => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return {
      start: startOfWeek(dateObj, { weekStartsOn: 1 }), // Monday
      end: endOfWeek(dateObj, { weekStartsOn: 1 }),
    };
  },

  /**
   * Get start and end of month
   */
  month: (date: Date | string) => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return {
      start: startOfMonth(dateObj),
      end: endOfMonth(dateObj),
    };
  },

  /**
   * Get start and end of year
   */
  year: (date: Date | string) => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return {
      start: startOfYear(dateObj),
      end: endOfYear(dateObj),
    };
  },
};

// Date manipulation functions
export const manipulateDate = {
  /**
   * Add days to a date
   */
  addDays: (date: Date | string, amount: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return addDays(dateObj, amount);
  },

  /**
   * Add weeks to a date
   */
  addWeeks: (date: Date | string, amount: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return addWeeks(dateObj, amount);
  },

  /**
   * Add months to a date
   */
  addMonths: (date: Date | string, amount: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return addMonths(dateObj, amount);
  },

  /**
   * Add years to a date
   */
  addYears: (date: Date | string, amount: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return addYears(dateObj, amount);
  },

  /**
   * Subtract days from a date
   */
  subtractDays: (date: Date | string, amount: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return subDays(dateObj, amount);
  },

  /**
   * Subtract weeks from a date
   */
  subtractWeeks: (date: Date | string, amount: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return subWeeks(dateObj, amount);
  },

  /**
   * Subtract months from a date
   */
  subtractMonths: (date: Date | string, amount: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return subMonths(dateObj, amount);
  },

  /**
   * Subtract years from a date
   */
  subtractYears: (date: Date | string, amount: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return subYears(dateObj, amount);
  },
};

// Date difference functions
export const getDateDifference = {
  /**
   * Get difference in days between two dates
   */
  days: (startDate: Date | string, endDate: Date | string): number => {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return differenceInDays(end, start);
  },

  /**
   * Get difference in weeks between two dates
   */
  weeks: (startDate: Date | string, endDate: Date | string): number => {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return differenceInWeeks(end, start);
  },

  /**
   * Get difference in months between two dates
   */
  months: (startDate: Date | string, endDate: Date | string): number => {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return differenceInMonths(end, start);
  },

  /**
   * Get difference in years between two dates
   */
  years: (startDate: Date | string, endDate: Date | string): number => {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return differenceInYears(end, start);
  },

  /**
   * Get difference in hours between two dates
   */
  hours: (startDate: Date | string, endDate: Date | string): number => {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return differenceInHours(end, start);
  },

  /**
   * Get difference in minutes between two dates
   */
  minutes: (startDate: Date | string, endDate: Date | string): number => {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return differenceInMinutes(end, start);
  },

  /**
   * Get difference in seconds between two dates
   */
  seconds: (startDate: Date | string, endDate: Date | string): number => {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return differenceInSeconds(end, start);
  },
};

// Date validation and comparison functions
export const dateUtils = {
  /**
   * Check if a date is valid
   */
  isValid: (date: Date | string): boolean => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isValid(dateObj);
  },

  /**
   * Check if date is today
   */
  isToday: (date: Date | string): boolean => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isToday(dateObj);
  },

  /**
   * Check if date is yesterday
   */
  isYesterday: (date: Date | string): boolean => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isYesterday(dateObj);
  },

  /**
   * Check if date is tomorrow
   */
  isTomorrow: (date: Date | string): boolean => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isTomorrow(dateObj);
  },

  /**
   * Check if date is this week
   */
  isThisWeek: (date: Date | string): boolean => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isThisWeek(dateObj, { weekStartsOn: 1 });
  },

  /**
   * Check if date is this month
   */
  isThisMonth: (date: Date | string): boolean => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isThisMonth(dateObj);
  },

  /**
   * Check if date is this year
   */
  isThisYear: (date: Date | string): boolean => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isThisYear(dateObj);
  },

  /**
   * Check if two dates are the same day
   */
  isSameDay: (date1: Date | string, date2: Date | string): boolean => {
    const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
    const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
    return isSameDay(d1, d2);
  },

  /**
   * Check if two dates are the same week
   */
  isSameWeek: (date1: Date | string, date2: Date | string): boolean => {
    const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
    const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
    return isSameWeek(d1, d2, { weekStartsOn: 1 });
  },

  /**
   * Check if two dates are the same month
   */
  isSameMonth: (date1: Date | string, date2: Date | string): boolean => {
    const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
    const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
    return isSameMonth(d1, d2);
  },

  /**
   * Check if two dates are the same year
   */
  isSameYear: (date1: Date | string, date2: Date | string): boolean => {
    const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
    const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
    return isSameYear(d1, d2);
  },

  /**
   * Check if first date is before second date
   */
  isBefore: (date1: Date | string, date2: Date | string): boolean => {
    const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
    const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
    return isBefore(d1, d2);
  },

  /**
   * Check if first date is after second date
   */
  isAfter: (date1: Date | string, date2: Date | string): boolean => {
    const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
    const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
    return isAfter(d1, d2);
  },

  /**
   * Check if date is in the future
   */
  isInFuture: (date: Date | string): boolean => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return isAfter(d, new Date());
  },

  /**
   * Check if two dates are equal
   */
  isEqual: (date1: Date | string, date2: Date | string): boolean => {
    const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
    const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
    return isEqual(d1, d2);
  },
};

// Unix timestamp functions
export const unixUtils = {
  /**
   * Convert Unix timestamp to Date
   */
  fromUnix: (timestamp: number): Date => {
    return fromUnixTime(timestamp);
  },

  /**
   * Convert Date to Unix timestamp
   */
  toUnix: (date: Date | string): number => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return getUnixTime(dateObj);
  },

  /**
   * Get current Unix timestamp
   */
  now: (): number => {
    return getUnixTime(new Date());
  },
};

// Date component getters
export const getDateComponents = {
  /**
   * Get hours from date
   */
  hours: (date: Date | string): number => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return getHours(dateObj);
  },

  /**
   * Get minutes from date
   */
  minutes: (date: Date | string): number => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return getMinutes(dateObj);
  },

  /**
   * Get seconds from date
   */
  seconds: (date: Date | string): number => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return getSeconds(dateObj);
  },

  /**
   * Get day of month from date
   */
  day: (date: Date | string): number => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return getDate(dateObj);
  },

  /**
   * Get day of week from date (0 = Sunday, 1 = Monday, etc.)
   */
  dayOfWeek: (date: Date | string): number => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return getDay(dateObj);
  },

  /**
   * Get month from date (0 = January, 1 = February, etc.)
   */
  month: (date: Date | string): number => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return getMonth(dateObj);
  },

  /**
   * Get year from date
   */
  year: (date: Date | string): number => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return getYear(dateObj);
  },
};

// Date setters
export const setDateComponents = {
  /**
   * Set hours for a date
   */
  hours: (date: Date | string, hours: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return setHours(dateObj, hours);
  },

  /**
   * Set minutes for a date
   */
  minutes: (date: Date | string, minutes: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return setMinutes(dateObj, minutes);
  },

  /**
   * Set seconds for a date
   */
  seconds: (date: Date | string, seconds: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return setSeconds(dateObj, seconds);
  },

  /**
   * Set day of month for a date
   */
  day: (date: Date | string, day: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return setDate(dateObj, day);
  },

  /**
   * Set month for a date
   */
  month: (date: Date | string, month: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return setMonth(dateObj, month);
  },

  /**
   * Set year for a date
   */
  year: (date: Date | string, year: number): Date => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return setYear(dateObj, year);
  },
};

// Utility functions for common use cases
export const calendarUtils = {
  /**
   * Format a date for display based on how recent it is
   * - Today: "Today at 2:30 PM"
   * - Yesterday: "Yesterday at 2:30 PM"
   * - This week: "Monday at 2:30 PM"
   * - This year: "January 15 at 2:30 PM"
   * - Other: "January 15, 2023 at 2:30 PM"
   */
  smartFormat: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return `Today at ${formatTime.standard(dateObj)}`;
    }

    if (isYesterday(dateObj)) {
      return `Yesterday at ${formatTime.standard(dateObj)}`;
    }

    if (isThisWeek(dateObj, { weekStartsOn: 1 })) {
      return `${format(dateObj, "EEEE")} at ${formatTime.standard(dateObj)}`;
    }

    if (isThisYear(dateObj)) {
      return `${format(dateObj, "MMMM d")} at ${formatTime.standard(dateObj)}`;
    }

    return formatDateTime.long(dateObj);
  },

  /**
   * Get a human-readable duration between two dates
   */
  getDuration: (startDate: Date | string, endDate: Date | string): string => {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    const days = differenceInDays(end, start);
    const hours = differenceInHours(end, start) % 24;
    const minutes = differenceInMinutes(end, start) % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  /**
   * Check if a date is within a specified range
   */
  isInRange: (
    date: Date | string,
    startDate: Date | string,
    endDate: Date | string
  ): boolean => {
    const d = typeof date === "string" ? parseISO(date) : date;
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    return (
      (isAfter(d, start) || isEqual(d, start)) &&
      (isBefore(d, end) || isEqual(d, end))
    );
  },

  /**
   * Get the age from a birth date
   */
  getAge: (birthDate: Date | string): number => {
    const birth =
      typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
    return differenceInYears(new Date(), birth);
  },
};

const exportFunctions = {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  getDateRange,
  manipulateDate,
  getDateDifference,
  dateUtils,
  unixUtils,
  getDateComponents,
  setDateComponents,
  calendarUtils,
};

export default exportFunctions;
