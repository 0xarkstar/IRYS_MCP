/**
 * IRYS MCP Server Module
 * 
 * This module creates and configures the FastMCP server with all IRYS tools.
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';

import { schemas } from '../types/index.js';
import configManager from '../config/index.js';
import logger from '../utils/logger.js';
import validationUtil from '../utils/validation.js';
import irysService from '../services/irysService.js';

/**
 * MCP Server class
 */
class MCPServer {
  constructor() {
    this.server = null;
    this.config = configManager.getSummary();
  }

  /**
   * Initialize the FastMCP server
   */
  initialize() {
    try {
      // Create FastMCP server instance
      this.server = new FastMCP({
        name: 'irys-mcp-server',
        version: '1.0.0'
      });

      // Add all MCP tools
      this.addTools();

      logger.info('MCP Server initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize MCP server:', error);
      return false;
    }
  }

  /**
   * Add all MCP tools to the server
   */
  addTools() {
    // 1. Connection check tool
    this.server.addTool({
      name: 'irys_check_connection',
      description: 'IRYS L1 체인 연결 상태를 확인합니다',
      inputSchema: schemas.connectionCheck,
      execute: async (...args) => {
        try {
          logger.logToolExecution('irys_check_connection', args);
          
          const parsedArgs = validationUtil.parseFastMCPArgs(args, ['tokenType']);
          const validation = validationUtil.validateConnectionCheck(parsedArgs || { tokenType: 'ethereum' });
          
          if (!validation.isValid) {
            throw new Error(validation.error.message);
          }

          const result = await irysService.checkConnection(validation.data.tokenType);
          
          if (result.success) {
            const data = result.data;
            return `${data.message}\n\n네트워크 정보:\n- 네트워크: ${data.network}\n- Chain ID: ${data.chainId}\n- 토큰 타입: ${data.tokenType}\n- 티커: ${data.ticker}\n- 단위: ${data.atomicUnit}\n- 소수점: ${data.decimals}\n- RPC URL: ${data.rpcUrl}\n- 익스플로러: ${data.explorerUrl}\n- 지갑: ${data.walletUrl}${data.simulation ? '\n- 모드: 시뮬레이션' : ''}`;
          } else {
            throw new Error(result.error.message);
          }
        } catch (error) {
          logger.error('Connection check tool failed:', error);
          throw error;
        }
      }
    });

    // 2. Balance check tool
    this.server.addTool({
      name: 'irys_get_balance',
      description: 'IRYS L1 체인 잔액을 조회합니다',
      inputSchema: schemas.balanceCheck,
      execute: async (...args) => {
        try {
          logger.logToolExecution('irys_get_balance', args);
          
          const parsedArgs = validationUtil.parseFastMCPArgs(args, ['tokenType']);
          const validation = validationUtil.validateBalanceCheck(parsedArgs || { tokenType: 'ethereum' });
          
          if (!validation.isValid) {
            throw new Error(validation.error.message);
          }

          const result = await irysService.getBalance(validation.data.tokenType, validation.data.address);
          
          if (result.success) {
            const data = result.data;
            return `잔액 정보:\n- 잔액: ${data.formattedBalance}\n- 토큰 타입: ${data.tokenType}\n- Chain ID: ${data.chainId}\n- 티커: ${data.ticker}\n- 주소: ${data.address}${data.simulation ? '\n- 모드: 시뮬레이션' : ''}`;
          } else {
            throw new Error(result.error.message);
          }
        } catch (error) {
          logger.error('Balance check tool failed:', error);
          throw error;
        }
      }
    });

    // 3. GraphQL query tool
    this.server.addTool({
      name: 'irys_arweave_query',
      description: 'IRYS L1 체인 GraphQL 쿼리를 실행합니다',
      inputSchema: schemas.graphqlQuery,
      execute: async (...args) => {
        try {
          logger.logToolExecution('irys_arweave_query', args);
          
          const parsedArgs = validationUtil.parseFastMCPArgs(args, ['query']);
          const validation = validationUtil.validateGraphQLQuery(parsedArgs || { 
            query: 'query { transactions(limit: 5) { edges { node { id address token timestamp } } } }',
            timeout: 15000
          });
          
          if (!validation.isValid) {
            throw new Error(validation.error.message);
          }

          const result = await irysService.executeGraphQLQuery(validation.data.query, validation.data.timeout);
          
          if (result.success) {
            const data = result.data;
            return `GraphQL 쿼리 결과:\n\n쿼리: ${data.query}\n타임아웃: ${data.timeout}ms\nURL: ${data.url}\n\n결과:\n${JSON.stringify(data.result, null, 2)}${data.simulation ? '\n\n모드: 시뮬레이션' : ''}`;
          } else {
            throw new Error(result.error.message);
          }
        } catch (error) {
          logger.error('GraphQL query tool failed:', error);
          throw error;
        }
      }
    });

    // 4. File upload tool
    this.server.addTool({
      name: 'irys_upload_file',
      description: 'IRYS L1 체인에 파일을 업로드합니다',
      inputSchema: schemas.fileUpload,
      execute: async (...args) => {
        try {
          logger.logToolExecution('irys_upload_file', args);
          
          const parsedArgs = validationUtil.parseFastMCPArgs(args, ['filePath', 'tokenType']);
          const validation = validationUtil.validateFileUpload(parsedArgs || { 
            filePath: 'test.txt',
            tokenType: 'ethereum',
            tags: []
          });
          
          if (!validation.isValid) {
            throw new Error(validation.error.message);
          }

          const result = await irysService.uploadFile(
            validation.data.filePath,
            validation.data.tokenType,
            validation.data.tags || []
          );
          
          if (result.success) {
            const data = result.data;
            return `파일 업로드 결과:\n\n${data.message}\n- 트랜잭션 ID: ${data.transactionId}\n- 파일 경로: ${data.filePath}\n- 토큰 타입: ${data.tokenType}\n- 태그: ${JSON.stringify(data.tags)}${data.simulation ? '\n- 모드: 시뮬레이션' : ''}`;
          } else {
            throw new Error(result.error.message);
          }
        } catch (error) {
          logger.error('File upload tool failed:', error);
          throw error;
        }
      }
    });

    // 5. Upload status tool
    this.server.addTool({
      name: 'irys_get_upload_status',
      description: '업로드 상태를 확인합니다',
      inputSchema: schemas.uploadStatus,
      execute: async (...args) => {
        try {
          logger.logToolExecution('irys_get_upload_status', args);
          
          const parsedArgs = validationUtil.parseFastMCPArgs(args, ['transactionId']);
          const validation = validationUtil.validateUploadStatus(parsedArgs || { 
            transactionId: 'test-transaction-id'
          });
          
          if (!validation.isValid) {
            throw new Error(validation.error.message);
          }

          const result = await irysService.getUploadStatus(validation.data.transactionId);
          
          if (result.success) {
            const data = result.data;
            return `업로드 상태:\n\n${data.message}\n- 트랜잭션 ID: ${data.transactionId}\n- 상태: ${data.status}${data.simulation ? '\n- 모드: 시뮬레이션' : ''}`;
          } else {
            throw new Error(result.error.message);
          }
        } catch (error) {
          logger.error('Upload status tool failed:', error);
          throw error;
        }
      }
    });

    // 6. Testnet operations tool
    this.server.addTool({
      name: 'irys_testnet_operations',
      description: 'IRYS 테스트넷 작업을 수행합니다',
      inputSchema: schemas.testnetOperations,
      execute: async (...args) => {
        try {
          logger.logToolExecution('irys_testnet_operations', args);
          
          const parsedArgs = validationUtil.parseFastMCPArgs(args, ['operation']);
          const validation = validationUtil.validateTestnetOperations(parsedArgs || { 
            operation: 'check_balance',
            tokenType: 'ethereum'
          });
          
          if (!validation.isValid) {
            throw new Error(validation.error.message);
          }

          const result = await irysService.executeTestnetOperation(
            validation.data.operation,
            validation.data.tokenType
          );
          
          if (result.success) {
            const data = result.data;
            let response = `테스트넷 작업 결과:\n\n작업: ${data.operation}\n메시지: ${data.message}`;
            
            if (data.balance) {
              response += `\n잔액: ${data.formattedBalance}`;
            }
            
            if (data.chainId) {
              response += `\n체인 ID: ${data.chainId}`;
            }
            
            if (data.tokenType) {
              response += `\n토큰 타입: ${data.tokenType}`;
            }
            
            if (data.simulation) {
              response += '\n모드: 시뮬레이션';
            }
            
            return response;
          } else {
            throw new Error(result.error.message);
          }
        } catch (error) {
          logger.error('Testnet operations tool failed:', error);
          throw error;
        }
      }
    });

    logger.info('All MCP tools added successfully');
  }

  /**
   * Start the server
   */
  async start() {
    try {
      if (!this.server) {
        throw new Error('Server not initialized');
      }

      // Log server startup information
      logger.logServerStart(this.config);

      // Start the server with correct FastMCP parameters
      await this.server.start({
        transportType: "httpStream",
        httpStream: {
          port: this.config.server.port,
          endpoint: "/mcp"
        }
      });

      logger.info('🧪 Ready for IRYS operations!');
      logger.info('📝 Note: This is a working simulation mode for testing');
      logger.info('🚀 FastMCP integration is complete and functional!');

      return true;
    } catch (error) {
      logger.error('Failed to start server:', error);
      return false;
    }
  }

  /**
   * Stop the server
   */
  async stop() {
    try {
      if (this.server) {
        await this.server.close();
        logger.info('Server stopped successfully');
      }
    } catch (error) {
      logger.error('Failed to stop server:', error);
    }
  }
}

export default MCPServer; 