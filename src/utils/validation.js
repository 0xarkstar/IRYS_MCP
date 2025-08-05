/**
 * IRYS MCP Server Validation Utility
 * 
 * This module provides input validation and sanitization functions.
 */

import { schemas, ERROR_TYPES } from '../types/index.js';

/**
 * Validation utility class
 */
class ValidationUtil {
  /**
   * Validate connection check arguments
   */
  validateConnectionCheck(args) {
    try {
      const result = schemas.connectionCheck.parse(args);
      return { isValid: true, data: result };
    } catch (error) {
      return {
        isValid: false,
        error: {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Invalid connection check arguments',
          details: error.errors
        }
      };
    }
  }

  /**
   * Validate balance check arguments
   */
  validateBalanceCheck(args) {
    try {
      const result = schemas.balanceCheck.parse(args);
      return { isValid: true, data: result };
    } catch (error) {
      return {
        isValid: false,
        error: {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Invalid balance check arguments',
          details: error.errors
        }
      };
    }
  }

  /**
   * Validate GraphQL query arguments
   */
  validateGraphQLQuery(args) {
    try {
      const result = schemas.graphqlQuery.parse(args);
      return { isValid: true, data: result };
    } catch (error) {
      return {
        isValid: false,
        error: {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Invalid GraphQL query arguments',
          details: error.errors
        }
      };
    }
  }

  /**
   * Validate file upload arguments
   */
  validateFileUpload(args) {
    try {
      const result = schemas.fileUpload.parse(args);
      return { isValid: true, data: result };
    } catch (error) {
      return {
        isValid: false,
        error: {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Invalid file upload arguments',
          details: error.errors
        }
      };
    }
  }

  /**
   * Validate upload status arguments
   */
  validateUploadStatus(args) {
    try {
      const result = schemas.uploadStatus.parse(args);
      return { isValid: true, data: result };
    } catch (error) {
      return {
        isValid: false,
        error: {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Invalid upload status arguments',
          details: error.errors
        }
      };
    }
  }

  /**
   * Validate testnet operations arguments
   */
  validateTestnetOperations(args) {
    try {
      const result = schemas.testnetOperations.parse(args);
      return { isValid: true, data: result };
    } catch (error) {
      return {
        isValid: false,
        error: {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Invalid testnet operations arguments',
          details: error.errors
        }
      };
    }
  }

  /**
   * Parse FastMCP arguments (handles different argument passing patterns)
   */
  parseFastMCPArgs(args, expectedKeys) {
    if (!args || args.length === 0) {
      return null;
    }

    // Handle different argument patterns
    let parsedArgs = null;

    // Pattern 1: First argument is an object
    if (args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
      parsedArgs = args[0];
    }
    // Pattern 2: Second argument is an object
    else if (args[1] && typeof args[1] === 'object' && !Array.isArray(args[1])) {
      parsedArgs = args[1];
    }
    // Pattern 3: Multiple arguments as key-value pairs
    else if (args.length >= 2 && typeof args[0] === 'string') {
      parsedArgs = {};
      for (let i = 0; i < args.length; i += 2) {
        if (args[i] && args[i + 1] !== undefined) {
          parsedArgs[args[i]] = args[i + 1];
        }
      }
    }

    // Validate that all expected keys are present
    if (parsedArgs && expectedKeys) {
      const missingKeys = expectedKeys.filter(key => !(key in parsedArgs));
      if (missingKeys.length > 0) {
        return null;
      }
    }

    return parsedArgs;
  }

  /**
   * Sanitize string input
   */
  sanitizeString(input) {
    if (typeof input !== 'string') {
      return '';
    }
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate file path
   */
  validateFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    // Basic path validation
    const sanitizedPath = this.sanitizeString(filePath);
    if (sanitizedPath.length === 0) {
      return false;
    }

    // Check for path traversal attempts
    if (sanitizedPath.includes('..') || sanitizedPath.includes('//')) {
      return false;
    }

    return true;
  }

  /**
   * Validate transaction ID
   */
  validateTransactionId(txId) {
    if (!txId || typeof txId !== 'string') {
      return false;
    }

    const sanitizedId = this.sanitizeString(txId);
    if (sanitizedId.length === 0) {
      return false;
    }

    // Basic format validation (alphanumeric and hyphens)
    return /^[a-zA-Z0-9\-_]+$/.test(sanitizedId);
  }
}

// Create singleton instance
const validationUtil = new ValidationUtil();

export default validationUtil;
export { ValidationUtil }; 