import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

/** D42: one logical world tick per quarter-hour, on the hour and at minutes 15, 30 and 45 UTC. */
crons.cron('world tick', '0,15,30,45 * * * *', internal.sim.runs.tick.startTick, {})

/** Stalled-run detection and guarded recovery (simulation.md "Watchdog"). */
crons.interval('tick watchdog', { minutes: 5 }, internal.sim.runs.tick.watchdog, {})

/** D115: daily platform achievement rarity, after the cleanup and away from the tick slots. */
crons.daily('platform tally', { hourUTC: 3, minuteUTC: 27 }, internal.platformProfile.tally, {})

/** Bounded retention cleanup (data-model.md), away from tick slots. */
crons.daily('retention cleanup', { hourUTC: 3, minuteUTC: 5 }, internal.maintenance.cleanup, {})

/** The day's engagement report kept for trends (D197), just before midnight UTC and away from every tick slot. */
crons.cron('engagement snapshot', '52 23 * * *', internal.admin.snapshotEngagement, {})

/** D198: the one reminder to owners who never opened the companion, mid-morning in Europe; sends nothing until HERO_REMINDERS=on. */
crons.cron('hero reminders', '7 9 * * *', internal.heroReminder.queueDaily, {})

export default crons
