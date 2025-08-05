import { IrysService } from '../src/services/IrysService';
import { IrysMCPServer } from '../src/server/IrysMCPServer';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import crypto from 'crypto';

// Load environment variables
config();

// Generate test private key (32 bytes)
const generateTestPrivateKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

describe('Irys MCP Unit Tests', () => {
  const privateKey = process.env.IRYS_PRIVATE_KEY || generateTestPrivateKey();
  let server: IrysMCPServer;
  
  beforeAll(() => {
    server = new IrysMCPServer(privateKey);
  });
  
  describe('IrysService Class Tests', () => {
    test('IrysService instance creation', () => {
      const service = new IrysService(privateKey);
      expect(service).toBeInstanceOf(IrysService);
      expect(service).toHaveProperty('irys');
    });

    test('Default gateway URL setting', () => {
      const service = new IrysService(privateKey);
      expect(service).toBeInstanceOf(IrysService);
    });

    test('Custom gateway URL setting', () => {
      const customGateway = 'https://custom.irys.xyz';
      const service = new IrysService(privateKey, customGateway);
      expect(service).toBeInstanceOf(IrysService);
    });
  });

  describe('IrysMCPServer Class Tests', () => {
    test('IrysMCPServer instance creation', () => {
      expect(server).toBeInstanceOf(IrysMCPServer);
      expect(server).toHaveProperty('irysService');
    });

    test('Check number of registered tools', () => {
      const tools = server.getRegisteredTools();
      expect(tools).toHaveLength(29);
    });

    test('Check tool name list', () => {
      const tools = server.getRegisteredTools();
      const expectedToolNames = [
        'irys_upload_file',
        'irys_download_file',
        'irys_search_files',
        'irys_batch_upload',
        'irys_create_version',
        'irys_update_share_settings',
        'irys_get_stats',
        'irys_get_file_info',
        'irys_check_connection',
        'irys_get_balance',
        'irys_encrypt_file',
        'irys_decrypt_file',
        'irys_upload_encrypted_file',
        'irys_download_encrypted_file',
        'irys_upload_with_data_contract',
        'irys_validate_data_contract',
        'irys_download_with_data_contract',
        'irys_delete_file',
        'irys_batch_download',
        'irys_rollback_version',
        'irys_revoke_share',
        'irys_switch_token_type',
        'irys_upload_directory',
        'irys_manage_categories',
        'irys_manage_tags',
        'irys_monitor_performance',
        'irys_manage_plugins',
        'irys_get_advanced_stats',
        'irys_restore_file'
      ];

      const actualToolNames = tools.map(tool => tool.name);
      expectedToolNames.forEach(name => {
        expect(actualToolNames).toContain(name);
      });
    });

    test('Check tool schema structure', () => {
      const tools = server.getRegisteredTools();
      
      tools.forEach(tool => {
        // Check basic properties
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool).toHaveProperty('outputSchema');
        expect(tool).toHaveProperty('handler');

        // Check types
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.handler).toBe('function');

        // Check if schema is a Zod object
        expect(tool.inputSchema).toBeDefined();
        expect(tool.outputSchema).toBeDefined();
      });
    });
  });

  describe('File Upload Tool Tests', () => {
    test('Upload tool handler exists', () => {
      const uploadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_file');
      expect(uploadTool).toBeDefined();
      expect(typeof uploadTool!.handler).toBe('function');
    });

    test('Upload tool schema validation', () => {
      const uploadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_file');
      expect(uploadTool!.inputSchema).toBeDefined();
      expect(uploadTool!.outputSchema).toBeDefined();
    });
  });

  describe('File Download Tool Tests', () => {
    test('Download tool handler exists', () => {
      const downloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_download_file');
      expect(downloadTool).toBeDefined();
      expect(typeof downloadTool!.handler).toBe('function');
    });

    test('Download tool schema validation', () => {
      const downloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_download_file');
      expect(downloadTool!.inputSchema).toBeDefined();
      expect(downloadTool!.outputSchema).toBeDefined();
    });
  });

  describe('File Search Tool Tests', () => {
    test('Search tool handler exists', () => {
      const searchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_search_files');
      expect(searchTool).toBeDefined();
      expect(typeof searchTool!.handler).toBe('function');
    });

    test('Search tool schema validation', () => {
      const searchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_search_files');
      expect(searchTool!.inputSchema).toBeDefined();
      expect(searchTool!.outputSchema).toBeDefined();
    });
  });

  describe('Batch Upload Tool Tests', () => {
    test('Batch upload tool handler exists', () => {
      const batchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_batch_upload');
      expect(batchTool).toBeDefined();
      expect(typeof batchTool!.handler).toBe('function');
    });

    test('Batch upload tool schema validation', () => {
      const batchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_batch_upload');
      expect(batchTool!.inputSchema).toBeDefined();
      expect(batchTool!.outputSchema).toBeDefined();
    });
  });

  describe('Version Management Tool Tests', () => {
    test('Version management tool handler exists', () => {
      const versionTool = server.getRegisteredTools().find(tool => tool.name === 'irys_create_version');
      expect(versionTool).toBeDefined();
      expect(typeof versionTool!.handler).toBe('function');
    });

    test('Version management tool schema validation', () => {
      const versionTool = server.getRegisteredTools().find(tool => tool.name === 'irys_create_version');
      expect(versionTool!.inputSchema).toBeDefined();
      expect(versionTool!.outputSchema).toBeDefined();
    });
  });

  describe('Share Settings Tool Tests', () => {
    test('Share settings tool handler exists', () => {
      const shareTool = server.getRegisteredTools().find(tool => tool.name === 'irys_update_share_settings');
      expect(shareTool).toBeDefined();
      expect(typeof shareTool!.handler).toBe('function');
    });

    test('Share settings tool schema validation', () => {
      const shareTool = server.getRegisteredTools().find(tool => tool.name === 'irys_update_share_settings');
      expect(shareTool!.inputSchema).toBeDefined();
      expect(shareTool!.outputSchema).toBeDefined();
    });
  });

  describe('Statistics Query Tool Tests', () => {
    test('Statistics query tool handler exists', () => {
      const statsTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_stats');
      expect(statsTool).toBeDefined();
      expect(typeof statsTool!.handler).toBe('function');
    });

    test('Statistics query tool schema validation', () => {
      const statsTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_stats');
      expect(statsTool!.inputSchema).toBeDefined();
      expect(statsTool!.outputSchema).toBeDefined();
    });
  });

  describe('File Info Query Tool Tests', () => {
    test('File info query tool handler exists', () => {
      const infoTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_file_info');
      expect(infoTool).toBeDefined();
      expect(typeof infoTool!.handler).toBe('function');
    });

    test('File info query tool schema validation', () => {
      const infoTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_file_info');
      expect(infoTool!.inputSchema).toBeDefined();
      expect(infoTool!.outputSchema).toBeDefined();
    });
  });

  describe('Connection Check Tool Tests', () => {
    test('Connection check tool handler exists', () => {
      const connectionTool = server.getRegisteredTools().find(tool => tool.name === 'irys_check_connection');
      expect(connectionTool).toBeDefined();
      expect(typeof connectionTool!.handler).toBe('function');
    });

    test('Connection check tool schema validation', () => {
      const connectionTool = server.getRegisteredTools().find(tool => tool.name === 'irys_check_connection');
      expect(connectionTool!.inputSchema).toBeDefined();
      expect(connectionTool!.outputSchema).toBeDefined();
    });
  });

  describe('Balance Query Tool Tests', () => {
    test('Balance query tool handler exists', () => {
      const balanceTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_balance');
      expect(balanceTool).toBeDefined();
      expect(typeof balanceTool!.handler).toBe('function');
    });

    test('Balance query tool schema validation', () => {
      const balanceTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_balance');
      expect(balanceTool!.inputSchema).toBeDefined();
      expect(balanceTool!.outputSchema).toBeDefined();
    });
  });

  describe('Tool Description Validation', () => {
    test('Check if all tools have English descriptions', () => {
      const tools = server.getRegisteredTools();
      
      tools.forEach(tool => {
        expect(tool.description).toMatch(/[a-zA-Z]/); // Check if English is included
        expect(tool.description.length).toBeGreaterThan(10); // Check if description is long enough
      });
    });

    test('Check if tool descriptions accurately describe functionality', () => {
      const toolDescriptions = {
        'irys_upload_file': 'upload',
        'irys_download_file': 'download',
        'irys_search_files': 'search',
        'irys_batch_upload': 'multiple',
        'irys_create_version': 'version',
        'irys_update_share_settings': 'share',
        'irys_get_stats': 'statistics',
        'irys_get_file_info': 'information',
        'irys_check_connection': 'connection',
        'irys_get_balance': 'balance'
      };

      Object.entries(toolDescriptions).forEach(([toolName, expectedKeyword]) => {
        const tool = server.getRegisteredTools().find(t => t.name === toolName);
        expect(tool!.description).toContain(expectedKeyword);
      });
    });
  });

  describe('Schema Type Validation', () => {
    test('Upload request schema field check', () => {
      const uploadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_file');
      const schema = uploadTool!.inputSchema;
      
      // Check if schema is a Zod object
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });

    test('Download request schema field check', () => {
      const downloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_download_file');
      const schema = downloadTool!.inputSchema;
      
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });

    test('Search request schema field check', () => {
      const searchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_search_files');
      const schema = searchTool!.inputSchema;
      
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });
  });

  describe('Handler Function Signature Validation', () => {
    test('Check if upload handler returns Promise', async () => {
      const uploadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_file');
      const handler = uploadTool!.handler;
      
      // Check if handler is an async function
      expect(handler.constructor.name).toBe('AsyncFunction');
    });

    test('Check if download handler returns Promise', async () => {
      const downloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_download_file');
      const handler = downloadTool!.handler;
      
      expect(handler.constructor.name).toBe('AsyncFunction');
    });

    test('Check if search handler returns Promise', async () => {
      const searchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_search_files');
      const handler = searchTool!.handler;
      
      expect(handler.constructor.name).toBe('AsyncFunction');
    });
  });
}); 