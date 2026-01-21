const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      meta,
      pid: process.pid
    }) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logsDir, filename);
    fs.appendFileSync(filePath, content);
  }

  info(message, meta = {}) {
    const logMessage = this.formatMessage('info', message, meta);
    console.log(`ℹ️  ${message}`, meta);
    this.writeToFile('app.log', logMessage);
  }

  error(message, meta = {}) {
    const logMessage = this.formatMessage('error', message, meta);
    console.error(`❌ ${message}`, meta);
    this.writeToFile('error.log', logMessage);
  }

  warn(message, meta = {}) {
    const logMessage = this.formatMessage('warn', message, meta);
    console.warn(`⚠️  ${message}`, meta);
    this.writeToFile('app.log', logMessage);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = this.formatMessage('debug', message, meta);
      console.log(`🐛 ${message}`, meta);
      this.writeToFile('debug.log', logMessage);
    }
  }

  http(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`;
    const logMessage = this.formatMessage('http', message, logData);
    
    if (res.statusCode >= 400) {
      console.error(`🌐 ${message}`);
      this.writeToFile('error.log', logMessage);
    } else {
      console.log(`🌐 ${message}`);
    }
    
    this.writeToFile('access.log', logMessage);
  }
}

module.exports = new Logger();