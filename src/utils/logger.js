/**
 * IRYS MCP Server Logger Utility
 * 
 * This module provides centralized logging functionality with different levels
 * and formatting options.
 */

import configManager from '../config/index.js';

/**
 * Logger class for consistent logging across the application
 */
class Logger {
  constructor() {
    this.config = configManager.getLogConfig();
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Check if log level should be output
   */
  shouldLog(level) {
    const currentLevel = this.levels[this.config.level] || this.levels.info;
    const messageLevel = this.levels[level] || this.levels.info;
    return messageLevel <= currentLevel;
  }

  /**
   * Format log message
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  /**
   * Log error message
   */
  error(message, data = null) {
    if (this.shouldLog('error')) {
      const formattedMessage = this.formatMessage('error', message, data);
      console.error(formattedMessage);
    }
  }

  /**
   * Log warning message
   */
  warn(message, data = null) {
    if (this.shouldLog('warn')) {
      const formattedMessage = this.formatMessage('warn', message, data);
      console.warn(formattedMessage);
    }
  }

  /**
   * Log info message
   */
  info(message, data = null) {
    if (this.shouldLog('info')) {
      const formattedMessage = this.formatMessage('info', message, data);
      console.log(formattedMessage);
    }
  }

  /**
   * Log debug message
   */
  debug(message, data = null) {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage('debug', message, data);
      console.log(formattedMessage);
    }
  }

  /**
   * Log server startup information
   */
  logServerStart(config) {
    this.info('🚀 Starting IRYS MCP Server with FastMCP...');
    this.info(`🌍 Network Type: ${config.network.type}`);
    this.info(`🌐 Gateway URL: ${config.network.rpcUrl}`);
    this.info(`🔍 Explorer URL: ${config.network.explorer}`);
    this.info(`👛 Wallet URL: ${config.network.wallet}`);
    this.info(`✅ Server started successfully on ${config.server.url}`);
    this.info('📝 FastMCP HTTP Streaming mode enabled');
    
    this.debug('🔧 Environment:', {
      network: config.network.type,
      gateway: config.network.rpcUrl,
      chainId: config.network.chainId,
      explorer: config.network.explorer,
      wallet: config.network.wallet,
      privateKey: config.privateKey ? 'Set' : 'Not set'
    });
  }

  /**
   * Log MCP tool execution
   */
  logToolExecution(toolName, args = null) {
    this.debug(`🔧 Executing MCP tool: ${toolName}`, args);
  }

  /**
   * Log connection test
   */
  logConnectionTest(tokenType, network) {
    this.debug(`🔗 Testing connection with ${tokenType} on ${network}...`);
  }

  /**
   * Log balance check
   */
  logBalanceCheck(tokenType, network) {
    this.debug(`💰 Getting balance for ${tokenType} on ${network}...`);
  }

  /**
   * Log GraphQL query
   */
  logGraphQLQuery(query, timeout) {
    this.debug('📊 Executing GraphQL query:', { query, timeout });
  }

  /**
   * Log file upload
   */
  logFileUpload(filePath, tokenType) {
    this.debug(`📁 Uploading file: ${filePath} with ${tokenType}`);
  }

  /**
   * Log testnet operation
   */
  logTestnetOperation(operation, tokenType) {
    this.debug(`🧪 Testnet operation: ${operation} with ${tokenType}`);
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
export { Logger }; 