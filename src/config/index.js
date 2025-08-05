/**
 * IRYS MCP Server Configuration
 * 
 * This module handles all configuration management including environment variables,
 * network settings, and server configuration.
 */

import { NETWORK_CONFIG, DEFAULTS, validatePrivateKey, detectTokenTypeFromPrivateKey, getPrivateKeyExamples } from '../types/index.js';

/**
 * Environment configuration loader
 */
class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
    this.privateKeyValidation = this.validatePrivateKeyConfig();
  }

  /**
   * Load configuration from environment variables
   */
  loadConfig() {
    return {
      // Server configuration
      port: parseInt(process.env.PORT) || DEFAULTS.PORT,
      host: process.env.HOST || 'localhost',
      
      // IRYS configuration
      privateKey: process.env.IRYS_PRIVATE_KEY,
      network: process.env.IRYS_NETWORK || DEFAULTS.DEFAULT_NETWORK,
      
      // Timeout settings
      timeout: parseInt(process.env.TIMEOUT) || DEFAULTS.TIMEOUT,
      graphqlTimeout: parseInt(process.env.GRAPHQL_TIMEOUT) || DEFAULTS.GRAPHQL_TIMEOUT,
      
      // Logging
      logLevel: process.env.LOG_LEVEL || 'info',
      
      // Development settings
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      
      // Simulation mode - default to false for real SDK usage
      simulationMode: process.env.SIMULATION_MODE === 'true' || false
    };
  }

  /**
   * Validate private key configuration
   */
  validatePrivateKeyConfig() {
    const privateKey = this.config.privateKey;
    
    if (!privateKey) {
      return {
        isValid: false,
        error: 'IRYS_PRIVATE_KEY environment variable is required',
        examples: getPrivateKeyExamples()
      };
    }

    // Auto-detect token type from private key format
    const validation = validatePrivateKey(privateKey);
    
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error,
        examples: getPrivateKeyExamples()
      };
    }

    return {
      isValid: true,
      tokenType: validation.tokenType,
      format: validation.format,
      detectedFromKey: true
    };
  }

  /**
   * Get detected token type from private key
   */
  getDetectedTokenType() {
    if (this.privateKeyValidation.isValid) {
      return this.privateKeyValidation.tokenType;
    }
    return DEFAULTS.DEFAULT_TOKEN_TYPE;
  }

  /**
   * Get network configuration
   */
  getNetworkConfig() {
    const network = this.config.network;
    return NETWORK_CONFIG[network] || NETWORK_CONFIG.testnet;
  }

  /**
   * Get server URL
   */
  getServerUrl() {
    return `http://${this.config.host}:${this.config.port}/mcp`;
  }

  /**
   * Validate configuration
   */
  validate() {
    const errors = [];

    // Check private key validation
    if (!this.privateKeyValidation.isValid) {
      errors.push(this.privateKeyValidation.error);
    }

    if (!NETWORK_CONFIG[this.config.network]) {
      errors.push(`Invalid network: ${this.config.network}`);
    }

    if (this.config.port < 1 || this.config.port > 65535) {
      errors.push(`Invalid port: ${this.config.port}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      privateKeyInfo: this.privateKeyValidation
    };
  }

  /**
   * Get configuration summary
   */
  getSummary() {
    const networkConfig = this.getNetworkConfig();
    const detectedTokenType = this.getDetectedTokenType();
    
    return {
      server: {
        url: this.getServerUrl(),
        port: this.config.port,
        host: this.config.host
      },
      network: {
        type: this.config.network,
        rpcUrl: networkConfig.rpcUrl,
        chainId: networkConfig.chainId,
        ticker: networkConfig.ticker,
        explorer: networkConfig.explorerUrl,
        wallet: networkConfig.walletUrl
      },
      privateKey: {
        isValid: this.privateKeyValidation.isValid,
        tokenType: detectedTokenType,
        format: this.privateKeyValidation.format,
        detectedFromKey: this.privateKeyValidation.detectedFromKey || false
      },
      features: {
        simulationMode: this.config.simulationMode,
        logLevel: this.config.logLevel,
        timeout: this.config.timeout,
        graphqlTimeout: this.config.graphqlTimeout
      }
    };
  }

  /**
   * Get configuration for logging
   */
  getLogConfig() {
    return {
      level: this.config.logLevel,
      format: this.config.isDevelopment ? 'development' : 'production',
      timestamp: true
    };
  }

  /**
   * Get private key examples for help
   */
  getPrivateKeyExamples() {
    return getPrivateKeyExamples();
  }

  /**
   * Print configuration help
   */
  printConfigurationHelp() {
    console.log('\n🔧 IRYS MCP Server Configuration Help');
    console.log('=' .repeat(50));
    
    if (!this.privateKeyValidation.isValid) {
      console.log('\n❌ Private Key Configuration Error:');
      console.log(this.privateKeyValidation.error);
      
      console.log('\n📝 Supported Private Key Formats:');
      this.privateKeyValidation.examples.forEach(example => {
        console.log(`\n${example.tokenType.toUpperCase()}:`);
        console.log(`  Description: ${example.description}`);
        console.log(`  Example: ${example.example}`);
      });
      
      console.log('\n💡 How to fix:');
      console.log('1. Create a .env file in your project root');
      console.log('2. Add your private key: IRYS_PRIVATE_KEY=your-private-key-here');
      console.log('3. Make sure .env is in your .gitignore file');
      console.log('4. Restart the server');
    } else {
      console.log('\n✅ Private Key Configuration:');
      console.log(`  Token Type: ${this.privateKeyValidation.tokenType}`);
      console.log(`  Format: ${this.privateKeyValidation.format}`);
      console.log(`  Auto-detected: ${this.privateKeyValidation.detectedFromKey ? 'Yes' : 'No'}`);
    }
    
    console.log('\n🌐 Network Configuration:');
    console.log(`  Network: ${this.config.network}`);
    console.log(`  RPC URL: ${this.getNetworkConfig().rpcUrl}`);
    console.log(`  Chain ID: ${this.getNetworkConfig().chainId}`);
    
    console.log('\n⚙️  Server Configuration:');
    console.log(`  Port: ${this.config.port}`);
    console.log(`  Host: ${this.config.host}`);
    console.log(`  Simulation Mode: ${this.config.simulationMode}`);
    
    console.log('\n🔗 Server URL:');
    console.log(`  ${this.getServerUrl()}`);
  }
}

// Create singleton instance
const configManager = new ConfigManager();

export default configManager;
export { ConfigManager }; 