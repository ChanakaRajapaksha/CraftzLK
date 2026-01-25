/**
 * Background Jobs Scheduler
 * Handles periodic cleanup and maintenance tasks
 */

const authService = require('../services/authService');

class BackgroundJobs {
  constructor() {
    this.intervals = [];
  }

  /**
   * Start all background jobs
   */
  start() {
    console.log('[BackgroundJobs] Starting background jobs...');

    // Clean up expired temporary passwords every 6 hours
    this.scheduleJob(
      'cleanupExpiredTemporaryPasswords',
      () => authService.cleanupExpiredTemporaryPasswords(),
      6 * 60 * 60 * 1000 // 6 hours
    );

    // Clean up expired reset tokens every 1 hour
    this.scheduleJob(
      'cleanupExpiredResetTokens',
      () => authService.cleanupExpiredResetTokens(),
      1 * 60 * 60 * 1000 // 1 hour
    );

    // Run initial cleanup on startup (after 10 seconds)
    setTimeout(() => {
      console.log('[BackgroundJobs] Running initial cleanup...');
      authService.cleanupExpiredTemporaryPasswords().catch(err => 
        console.error('[BackgroundJobs] Initial cleanup error (temp passwords):', err.message)
      );
      authService.cleanupExpiredResetTokens().catch(err => 
        console.error('[BackgroundJobs] Initial cleanup error (reset tokens):', err.message)
      );
    }, 10000);

    console.log('[BackgroundJobs] All background jobs started successfully');
  }

  /**
   * Schedule a recurring job
   * @param {string} name - Job name for logging
   * @param {Function} task - Async function to execute
   * @param {number} interval - Interval in milliseconds
   */
  scheduleJob(name, task, interval) {
    const intervalId = setInterval(async () => {
      try {
        console.log(`[BackgroundJobs] Running job: ${name}`);
        await task();
      } catch (error) {
        console.error(`[BackgroundJobs] Error in job ${name}:`, error.message);
      }
    }, interval);

    this.intervals.push({ name, intervalId, interval });
    console.log(`[BackgroundJobs] Scheduled job: ${name} (every ${interval / 1000 / 60} minutes)`);
  }

  /**
   * Stop all background jobs
   */
  stop() {
    console.log('[BackgroundJobs] Stopping all background jobs...');
    this.intervals.forEach(({ name, intervalId }) => {
      clearInterval(intervalId);
      console.log(`[BackgroundJobs] Stopped job: ${name}`);
    });
    this.intervals = [];
  }

  /**
   * Get status of all scheduled jobs
   */
  getStatus() {
    return this.intervals.map(({ name, interval }) => ({
      name,
      interval: `${interval / 1000 / 60} minutes`,
      status: 'running'
    }));
  }
}

module.exports = new BackgroundJobs();
