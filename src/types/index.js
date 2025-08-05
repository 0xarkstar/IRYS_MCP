/**
 * IRYS MCP Server Type Definitions
 * 
 * This module contains all type definitions and schemas used throughout the application.
 */

import { z } from 'zod';

// Token types supported by IRYS
export const TOKEN_TYPES = {
  ETHEREUM: 'ethereum',
  SOLANA: 'solana',
  APTOS: 'aptos'
};

export const TOKEN_TYPE_VALUES = Object.values(TOKEN_TYPES);

// Network types
export const NETWORK_TYPES = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  DEVNET: 'devnet'
};

export const NETWORK_TYPE_VALUES = Object.values(NETWORK_TYPES);

// Testnet operation types
export const TESTNET_OPERATIONS = {
  FUND: 'fund',
  CHECK_BALANCE: 'check_balance',
  UPLOAD_TEST: 'upload_test'
};

export const TESTNET_OPERATION_VALUES = Object.values(TESTNET_OPERATIONS);

// Private key format detection patterns
export const PRIVATE_KEY_PATTERNS = {
  ETHEREUM: {
    pattern: /^0x[a-fA-F0-9]{64}$/,
    description: 'Ethereum private key (0x + 64 hex characters)',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  SOLANA: {
    pattern: /^[1-9A-HJ-NP-Za-km-z]{60,88}$/,
    description: 'Solana private key (60-88 base58 characters)',
    example: '4NwwJRJYVkqH3GJKR9rT3M9VnwzKqH3GJKR9rT3M9VnwzKqH3GJKR9rT3M9Vnwz'
  },
  APTOS: {
    pattern: /^[a-fA-F0-9]{64}$/,
    description: 'Aptos private key (64 hex characters without 0x)',
    example: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  }
};

/**
 * Detect token type from private key format
 */
export function detectTokenTypeFromPrivateKey(privateKey) {
  if (!privateKey || typeof privateKey !== 'string') {
    return null;
  }

  const trimmedKey = privateKey.trim();
  
  for (const [tokenType, config] of Object.entries(PRIVATE_KEY_PATTERNS)) {
    if (config.pattern.test(trimmedKey)) {
      return TOKEN_TYPES[tokenType.toUpperCase()];
    }
  }
  
  return null;
}

/**
 * Validate private key format
 */
export function validatePrivateKey(privateKey, expectedTokenType = null) {
  if (!privateKey || typeof privateKey !== 'string') {
    return {
      isValid: false,
      error: 'Private key must be a non-empty string'
    };
  }

  const trimmedKey = privateKey.trim();
  
  if (expectedTokenType) {
    // Validate against specific token type
    const config = PRIVATE_KEY_PATTERNS[expectedTokenType.toUpperCase()];
    if (!config) {
      return {
        isValid: false,
        error: `Unknown token type: ${expectedTokenType}`
      };
    }
    
    if (!config.pattern.test(trimmedKey)) {
      return {
        isValid: false,
        error: `Invalid ${expectedTokenType} private key format. Expected: ${config.description}`
      };
    }
    
    return {
      isValid: true,
      tokenType: expectedTokenType,
      format: config.description
    };
  } else {
    // Auto-detect token type
    const detectedType = detectTokenTypeFromPrivateKey(trimmedKey);
    if (!detectedType) {
      return {
        isValid: false,
        error: 'Private key format not recognized. Supported formats:\n' +
               Object.entries(PRIVATE_KEY_PATTERNS)
                 .map(([type, config]) => `- ${type}: ${config.description}`)
                 .join('\n')
      };
    }
    
    return {
      isValid: true,
      tokenType: detectedType,
      format: PRIVATE_KEY_PATTERNS[detectedType.toUpperCase()].description
    };
  }
}

/**
 * Get private key format examples
 */
export function getPrivateKeyExamples() {
  return Object.entries(PRIVATE_KEY_PATTERNS).map(([type, config]) => ({
    tokenType: TOKEN_TYPES[type.toUpperCase()],
    description: config.description,
    example: config.example
  }));
}

// Zod schemas for validation
export const schemas = {
  // Connection check schema
  connectionCheck: z.object({
    tokenType: z.enum(TOKEN_TYPE_VALUES).describe('Token type for connection')
  }),

  // Balance check schema
  balanceCheck: z.object({
    tokenType: z.enum(TOKEN_TYPE_VALUES).describe('Token type for balance check'),
    address: z.string().optional().describe('Wallet address (optional)')
  }),

  // GraphQL query schema
  graphqlQuery: z.object({
    query: z.string().describe('GraphQL query string'),
    timeout: z.number().optional().describe('Query timeout in milliseconds')
  }),

  // File upload schema
  fileUpload: z.object({
    filePath: z.string().describe('Path to file to upload'),
    tokenType: z.enum(TOKEN_TYPE_VALUES).describe('Token type for upload'),
    tags: z.array(z.object({
      name: z.string(),
      value: z.string()
    })).optional().describe('Metadata tags')
  }),

  // Upload status schema
  uploadStatus: z.object({
    transactionId: z.string().describe('Transaction ID to check')
  }),

  // Testnet operations schema
  testnetOperations: z.object({
    operation: z.enum(TESTNET_OPERATION_VALUES).describe('Testnet operation type'),
    tokenType: z.enum(TOKEN_TYPE_VALUES).optional().describe('Token type')
  })
};

// Network configuration
export const NETWORK_CONFIG = {
  testnet: {
    rpcUrl: 'https://testnet-rpc.irys.xyz/v1/execution-rpc',
    chainId: 1270,
    ticker: 'IRYS',
    atomicUnit: 'mIRYS',
    decimals: 18,
    explorerUrl: 'https://testnet-explorer.irys.xyz',
    walletUrl: 'https://wallet.irys.xyz',
    graphqlUrl: 'https://uploader.irys.xyz/graphql'
  },
  mainnet: {
    rpcUrl: 'https://rpc.irys.xyz/v1/execution-rpc',
    chainId: 1269,
    ticker: 'IRYS',
    atomicUnit: 'mIRYS',
    decimals: 18,
    explorerUrl: 'https://explorer.irys.xyz',
    walletUrl: 'https://wallet.irys.xyz',
    graphqlUrl: 'https://uploader.irys.xyz/graphql'
  }
};

// Error types
export const ERROR_TYPES = {
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  BALANCE_ERROR: 'BALANCE_ERROR',
  GRAPHQL_ERROR: 'GRAPHQL_ERROR'
};

// Response types
export const RESPONSE_TYPES = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  SIMULATION: 'SIMULATION'
};

// Default values
export const DEFAULTS = {
  PORT: 8080,
  TIMEOUT: 10000,
  GRAPHQL_TIMEOUT: 15000,
  DEFAULT_NETWORK: 'testnet',
  DEFAULT_TOKEN_TYPE: 'ethereum'
}; 