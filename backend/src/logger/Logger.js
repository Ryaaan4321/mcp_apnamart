export class Logger {
  static LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  constructor(context = 'App', minLevel = 'info') {
    this.context = context;
    this.minLevel = Logger.LogLevel[minLevel.toUpperCase()] ?? Logger.LogLevel.INFO;
  }

  forContext(context) {
    return new Logger(context, Object.keys(Logger.LogLevel).find(k => Logger.LogLevel[k] === this.minLevel) || 'info');
  }

  _format(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? (meta instanceof Error ? `\n${meta.stack || meta.message}` : ` ${JSON.stringify(meta)}`) : '';
    return `[${timestamp}] [${level}] [${this.context}] ${message}${metaStr}`;
  }

  _write(streamMethod, formatted) {
    if (process.env.MCP_STDIO === 'true') {
      console.error(formatted);
    } else {
      console[streamMethod](formatted);
    }
  }

  debug(message, meta) {
    if (this.minLevel <= Logger.LogLevel.DEBUG) {
      this._write('debug', this._format('DEBUG', message, meta));
    }
  }

  info(message, meta) {
    if (this.minLevel <= Logger.LogLevel.INFO) {
      this._write('log', this._format('INFO', message, meta));
    }
  }

  warn(message, meta) {
    if (this.minLevel <= Logger.LogLevel.WARN) {
      this._write('warn', this._format('WARN', message, meta));
    }
  }

  error(message, errorOrMeta) {
    if (this.minLevel <= Logger.LogLevel.ERROR) {
      this._write('error', this._format('ERROR', message, errorOrMeta));
    }
  }
}

export const defaultLogger = new Logger('ApnaMart');
