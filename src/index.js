#!/usr/bin/env node

/**
 * IRYS MCP Server - Main Application Entry Point
 * 
 * This is the main entry point for the modularized IRYS MCP server.
 * It orchestrates the initialization and startup of all components.
 */

import configManager from './config/index.js';
import logger from './utils/logger.js';
import MCPServer from './server/mcpServer.js';

/**
 * Main application class
 */
class IrysMCPServerApp {
  constructor() {
    this.mcpServer = null;
    this.config = configManager.getSummary();
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      logger.info('🚀 Initializing IRYS MCP Server...');

      // Validate configuration
      const validation = configManager.validate();
      if (!validation.isValid) {
        logger.error('Configuration validation failed:');
        validation.errors.forEach(error => logger.error(`  - ${error}`));
        
        // Print configuration help if private key is invalid
        if (validation.privateKeyInfo && !validation.privateKeyInfo.isValid) {
          configManager.printConfigurationHelp();
        }
        
        return false;
      }

      // Print configuration summary
      const summary = configManager.getSummary();
      logger.info('✅ Configuration validated successfully');
      logger.info(`  Network: ${summary.network.type} (Chain ID: ${summary.network.chainId})`);
      logger.info(`  Token Type: ${summary.privateKey.tokenType} (${summary.privateKey.format})`);
      logger.info(`  Simulation Mode: ${summary.features.simulationMode ? 'Enabled' : 'Disabled'}`);

      // Initialize MCP server
      this.mcpServer = new MCPServer();
      const serverInitialized = this.mcpServer.initialize();
      
      if (!serverInitialized) {
        logger.error('Failed to initialize MCP server');
        return false;
      }

      logger.info('✅ Application initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      return false;
    }
  }

  /**
   * Start the application
   */
  async start() {
    try {
      logger.info('🚀 Starting IRYS MCP Server...');

      if (!this.mcpServer) {
        throw new Error('MCP server not initialized');
      }

      // Start the server
      const serverStarted = await this.mcpServer.start();
      
      if (!serverStarted) {
        logger.error('Failed to start MCP server');
        return false;
      }

      logger.info('✅ IRYS MCP Server started successfully');
      return true;
    } catch (error) {
      logger.error('Failed to start application:', error);
      return false;
    }
  }

  /**
   * Stop the application
   */
  async stop() {
    try {
      logger.info('🛑 Stopping IRYS MCP Server...');

      if (this.mcpServer) {
        await this.mcpServer.stop();
      }

      logger.info('✅ IRYS MCP Server stopped successfully');
    } catch (error) {
      logger.error('Failed to stop application:', error);
    }
  }

  /**
   * Handle graceful shutdown
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }

  /**
   * Run the application
   */
  async run() {
    try {
      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Initialize application
      const initialized = await this.initialize();
      if (!initialized) {
        logger.error('Failed to initialize application');
        process.exit(1);
      }

      // Start application
      const started = await this.start();
      if (!started) {
        logger.error('Failed to start application');
        process.exit(1);
      }

      logger.info('🎉 IRYS MCP Server is running successfully!');
      logger.info(`📡 Server URL: ${this.config.server.url}`);
      logger.info(`🌐 Network: ${this.config.network.type}`);
      logger.info(`🔗 Chain ID: ${this.config.network.chainId}`);
      logger.info(`💰 Ticker: ${this.config.network.ticker}`);

    } catch (error) {
      logger.error('Application failed to run:', error);
      process.exit(1);
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const app = new IrysMCPServerApp();
  await app.run();
}

// Run the application if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default IrysMCPServerApp; 