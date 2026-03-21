/**
 * Date Utilities
 * Date manipulation and formatting
 */

class DateUtil {
  /**
   * Get current timestamp
   * @returns {Date}
   */
  static now() {
    return new Date();
  }

  /**
   * Add days to date
   * @param {Date} date
   * @param {number} days
   * @returns {Date}
   */
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add hours to date
   * @param {Date} date
   * @param {number} hours
   * @returns {Date}
   */
  static addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Add minutes to date
   * @param {Date} date
   * @param {number} minutes
   * @returns {Date}
   */
  static addMinutes(date, minutes) {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  /**
   * Subtract days from date
   * @param {Date} date
   * @param {number} days
   * @returns {Date}
   */
  static subtractDays(date, days) {
    return this.addDays(date, -days);
  }

  /**
   * Check if date is in the past
   * @param {Date} date
   * @returns {boolean}
   */
  static isPast(date) {
    return date < new Date();
  }

  /**
   * Check if date is in the future
   * @param {Date} date
   * @returns {boolean}
   */
  static isFuture(date) {
    return date > new Date();
  }

  /**
   * Check if date is today
   * @param {Date} date
   * @returns {boolean}
   */
  static isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Get start of day
   * @param {Date} date
   * @returns {Date}
   */
  static startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day
   * @param {Date} date
   * @returns {Date}
   */
  static endOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get difference in days
   * @param {Date} date1
   * @param {Date} date2
   * @returns {number}
   */
  static diffInDays(date1, date2) {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get difference in hours
   * @param {Date} date1
   * @param {Date} date2
   * @returns {number}
   */
  static diffInHours(date1, date2) {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60));
  }

  /**
   * Get difference in minutes
   * @param {Date} date1
   * @param {Date} date2
   * @returns {number}
   */
  static diffInMinutes(date1, date2) {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / (1000 * 60));
  }

  /**
   * Format date to ISO string
   * @param {Date} date
   * @returns {string}
   */
  static toISOString(date) {
    return date.toISOString();
  }

  /**
   * Format date to YYYY-MM-DD
   * @param {Date} date
   * @returns {string}
   */
  static toDateString(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   * @param {Date} date
   * @param {string} [locale='vi-VN']
   * @returns {string}
   */
  static getRelativeTime(date, locale = 'vi-VN') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    
    return date.toLocaleDateString(locale);
  }
}

module.exports = { DateUtil };
