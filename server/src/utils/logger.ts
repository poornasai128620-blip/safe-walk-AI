type LogLevel = 'info' | 'warn' | 'error' | 'security';

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }));
  },
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }));
  },
  security: (message: string, context?: Record<string, unknown>) => {
    console.warn(JSON.stringify({
      level: 'SECURITY_AUDIT',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }));
  }
};
