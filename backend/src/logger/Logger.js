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

  debug(message, meta) {
    if (this.minLevel <= Logger.LogLevel.DEBUG) {
      console.debug(this._format('DEBUG', message, meta));
    }
  }

  info(message, meta) {
    if (this.minLevel <= Logger.LogLevel.INFO) {
      console.log(this._format('INFO', message, meta));
    }
  }

  warn(message, meta) {
    if (this.minLevel <= Logger.LogLevel.WARN) {
      console.warn(this._format('WARN', message, meta));
    }
  }

  error(message, errorOrMeta) {
    if (this.minLevel <= Logger.LogLevel.ERROR) {
      console.error(this._format('ERROR', message, errorOrMeta));
    }
  }
}

export const defaultLogger = new Logger('ApnaMart');
