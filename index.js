const ms = require('humanize-ms');
const safetimers = require('safe-timers');
const path = require('path');
const fs = require('fs');
const loadFile = require('./loadfile.js');

const safeInterval = (fn, delay, ...args) => {
  if (delay < safetimers.maxInterval) {
    setInterval(fn, delay, ...args);
  } else {
    safetimers.setInterval(fn, delay, ...args);
  }
};

// 加载定时任务
const loadSchedule = (app) => {
  const dir = path.join(process.cwd(), 'app/schedule');
  fs.readdirSync(dir).forEach((file) => {
    const job = loadFile(`${dir}/${file}`)(app);
    const interval = ms(job.schedule.interval);
    const runJob = async () => {
      await job.task(app.context.service);
    };
    if (job.schedule.immediate) {
      runJob();
    }
    safeInterval(runJob, interval);
  });
};

module.exports = (options, app) => {
  loadSchedule(app);
  return async function schedule(ctx, next) {
    await next();
  };
};
