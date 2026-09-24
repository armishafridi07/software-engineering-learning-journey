/**
 * Resilient Task Scheduler & Logger
 * ----------------------------------
 * A one-shot background-worker simulator that processes a fixed list of jobs
 * strictly in order, tolerates bad data without crashing, and prints a final
 * audit report.
 *
 * Architecture (see design notes):
 *   Gatekeeper -> validates a single job (pure function)
 *   Executor   -> runs the sequential loop, owns real setTimeout delays
 *   Logger     -> append-only event log (dumb, no derived stats)
 *   Reporter   -> pure function that turns the log into a text summary
 */

"use strict";

// ---------------------------------------------------------------------------
// 1. THE WORK ORDER LIST
// ---------------------------------------------------------------------------
// Each job SHOULD have: id (unique), name (string), durationMs (positive number).
// Several entries below are intentionally broken to exercise the Gatekeeper.

const jobs = [
  { id: "job-001", name: "Upload nightly backup", durationMs: 400 },
  { id: "job-002", name: "Compress log archive", durationMs: 250 },
  { id: "job-003", durationMs: 300 },                     // missing name
  { id: "job-004", name: "Sync user records" },            // missing durationMs
  { id: "job-005", name: "Purge temp files", durationMs: -150 }, // negative duration
  { id: "job-006", name: "Rotate credentials", durationMs: "soon" }, // wrong type
  { id: "job-007", name: "Rebuild search index", durationMs: NaN }, // NaN
  { id: "job-008", name: "Send digest emails", durationMs: 350 },
  { id: "job-009", name: "Reconcile billing", durationMs: 0 },       // edge: zero is valid (instant job)
  { id: "job-010", name: "Warm cache", durationMs: 200 },
];

// ---------------------------------------------------------------------------
// 2. THE SMART GATEKEEPER
// ---------------------------------------------------------------------------
// Pure validation: no side effects, no logging, just a verdict. This keeps it
// trivially unit-testable in isolation from the Executor/Logger.

function validateJob(job) {
  if (!job || typeof job !== "object") {
    return { ok: false, reason: "job is not a valid object" };
  }
  if (!job.id || typeof job.id !== "string") {
    return { ok: false, reason: "missing or invalid tracking ID" };
  }
  if (!job.name || typeof job.name !== "string") {
    return { ok: false, reason: "missing or invalid name" };
  }
  if (typeof job.durationMs !== "number" || Number.isNaN(job.durationMs)) {
    return { ok: false, reason: "missing or non-numeric duration" };
  }
  if (job.durationMs < 0) {
    return { ok: false, reason: `negative duration (${job.durationMs}ms) is impossible` };
  }
  const MAX_REASONABLE_MS = 60_000; // guard rail: don't let a "broken" job hang the run
  if (job.durationMs > MAX_REASONABLE_MS) {
    return { ok: false, reason: `duration (${job.durationMs}ms) exceeds sane limit` };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// 3. LOGGER
// ---------------------------------------------------------------------------
// Append-only event log. Doesn't know or care what a "report" looks like.

class Logger {
  constructor() {
    this.events = [];
  }

  _record(type, jobId, detail) {
    this.events.push({ ts: new Date().toISOString(), type, jobId, detail });
  }

  warn(jobId, reason) {
    this._record("SKIPPED", jobId, reason);
    console.warn(`⚠️  [${jobId}] SKIPPED — ${reason}`);
  }

  start(job) {
    this._record("STARTED", job.id, job.name);
    console.log(`▶️  [${job.id}] "${job.name}" starting...`);
  }

  complete(job, elapsedMs) {
    this._record("COMPLETED", job.id, `${elapsedMs.toFixed(0)}ms`);
    console.log(`✅ [${job.id}] "${job.name}" completed in ${elapsedMs.toFixed(0)}ms`);
  }
}

// ---------------------------------------------------------------------------
// 4. THE TIMING SIMULATION ENGINE + EXECUTOR (Approach A: async/await loop)
// ---------------------------------------------------------------------------

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runJobs(jobList, logger) {
  for (const job of jobList) {
    const result = validateJob(job);

    if (!result.ok) {
      logger.warn(job && job.id ? job.id : "unknown-id", result.reason);
      continue; // never let one bad job stop the queue
    }

    try {
      logger.start(job);
      const t0 = performance.now();
      await delay(job.durationMs); // real wait — Job B waits for Job A to fully finish
      const elapsed = performance.now() - t0;
      logger.complete(job, elapsed);
    } catch (err) {
      // defensive: catches anything unexpected during "execution" itself
      logger.warn(job.id, `execution error: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 5. THE FINAL AUDIT REPORT
// ---------------------------------------------------------------------------
// Pure function over the event log — computed once, at the end, from the
// single source of truth (the log), not tracked incrementally during the run.

function buildReport(events) {
  const completed = events.filter((e) => e.type === "COMPLETED");
  const skipped = events.filter((e) => e.type === "SKIPPED");

  const lines = [];
  lines.push("=".repeat(50));
  lines.push("           FINAL AUDIT REPORT");
  lines.push("=".repeat(50));
  lines.push(`Total jobs processed : ${completed.length + skipped.length}`);
  lines.push(`Succeeded            : ${completed.length}`);
  lines.push(`Skipped (invalid)    : ${skipped.length}`);
  lines.push("-".repeat(50));

  if (completed.length > 0) {
    lines.push("Successful jobs:");
    for (const e of completed) {
      lines.push(`  ✅ ${e.jobId} — ${e.detail}`);
    }
  }

  if (skipped.length > 0) {
    lines.push("Skipped jobs:");
    for (const e of skipped) {
      lines.push(`  ⚠️  ${e.jobId} — ${e.detail}`);
    }
  }

  lines.push("=".repeat(50));
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  console.log("Starting Resilient Task Scheduler...\n");
  const logger = new Logger();

  await runJobs(jobs, logger);

  console.log("\nAll jobs processed. Generating report...\n");
  const report = buildReport(logger.events);
  console.log(report);
}

main();
