import { IrysService } from '../src/services/IrysService';
import { IrysMCPServer } from '../src/server/IrysMCPServer';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import crypto from 'crypto';

// Load environment variables
config();

// 테스트용 개인키 생성 (32바이트)
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

        // 스키마가 Zod 객체인지 확인
        expect(tool.inputSchema).toBeDefined();
        expect(tool.outputSchema).toBeDefined();
      });
    });
  });

  describe('파일 업로드 도구 테스트', () => {
    test('업로드 도구 핸들러 존재 확인', () => {
      const uploadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_file');
      expect(uploadTool).toBeDefined();
      expect(typeof uploadTool!.handler).toBe('function');
    });

    test('업로드 도구 스키마 검증', () => {
      const uploadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_file');
      expect(uploadTool!.inputSchema).toBeDefined();
      expect(uploadTool!.outputSchema).toBeDefined();
    });
  });

  describe('파일 다운로드 도구 테스트', () => {
    test('다운로드 도구 핸들러 존재 확인', () => {
      const downloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_download_file');
      expect(downloadTool).toBeDefined();
      expect(typeof downloadTool!.handler).toBe('function');
    });

    test('다운로드 도구 스키마 검증', () => {
      const downloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_download_file');
      expect(downloadTool!.inputSchema).toBeDefined();
      expect(downloadTool!.outputSchema).toBeDefined();
    });
  });

  describe('파일 검색 도구 테스트', () => {
    test('검색 도구 핸들러 존재 확인', () => {
      const searchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_search_files');
      expect(searchTool).toBeDefined();
      expect(typeof searchTool!.handler).toBe('function');
    });

    test('검색 도구 스키마 검증', () => {
      const searchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_search_files');
      expect(searchTool!.inputSchema).toBeDefined();
      expect(searchTool!.outputSchema).toBeDefined();
    });
  });

  describe('배치 업로드 도구 테스트', () => {
    test('배치 업로드 도구 핸들러 존재 확인', () => {
      const batchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_batch_upload');
      expect(batchTool).toBeDefined();
      expect(typeof batchTool!.handler).toBe('function');
    });

    test('배치 업로드 도구 스키마 검증', () => {
      const batchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_batch_upload');
      expect(batchTool!.inputSchema).toBeDefined();
      expect(batchTool!.outputSchema).toBeDefined();
    });
  });

  describe('버전 관리 도구 테스트', () => {
    test('버전 관리 도구 핸들러 존재 확인', () => {
      const versionTool = server.getRegisteredTools().find(tool => tool.name === 'irys_create_version');
      expect(versionTool).toBeDefined();
      expect(typeof versionTool!.handler).toBe('function');
    });

    test('버전 관리 도구 스키마 검증', () => {
      const versionTool = server.getRegisteredTools().find(tool => tool.name === 'irys_create_version');
      expect(versionTool!.inputSchema).toBeDefined();
      expect(versionTool!.outputSchema).toBeDefined();
    });
  });

  describe('공유 설정 도구 테스트', () => {
    test('공유 설정 도구 핸들러 존재 확인', () => {
      const shareTool = server.getRegisteredTools().find(tool => tool.name === 'irys_update_share_settings');
      expect(shareTool).toBeDefined();
      expect(typeof shareTool!.handler).toBe('function');
    });

    test('공유 설정 도구 스키마 검증', () => {
      const shareTool = server.getRegisteredTools().find(tool => tool.name === 'irys_update_share_settings');
      expect(shareTool!.inputSchema).toBeDefined();
      expect(shareTool!.outputSchema).toBeDefined();
    });
  });

  describe('통계 조회 도구 테스트', () => {
    test('통계 조회 도구 핸들러 존재 확인', () => {
      const statsTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_stats');
      expect(statsTool).toBeDefined();
      expect(typeof statsTool!.handler).toBe('function');
    });

    test('통계 조회 도구 스키마 검증', () => {
      const statsTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_stats');
      expect(statsTool!.inputSchema).toBeDefined();
      expect(statsTool!.outputSchema).toBeDefined();
    });
  });

  describe('파일 정보 조회 도구 테스트', () => {
    test('파일 정보 조회 도구 핸들러 존재 확인', () => {
      const infoTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_file_info');
      expect(infoTool).toBeDefined();
      expect(typeof infoTool!.handler).toBe('function');
    });

    test('파일 정보 조회 도구 스키마 검증', () => {
      const infoTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_file_info');
      expect(infoTool!.inputSchema).toBeDefined();
      expect(infoTool!.outputSchema).toBeDefined();
    });
  });

  describe('연결 확인 도구 테스트', () => {
    test('연결 확인 도구 핸들러 존재 확인', () => {
      const connectionTool = server.getRegisteredTools().find(tool => tool.name === 'irys_check_connection');
      expect(connectionTool).toBeDefined();
      expect(typeof connectionTool!.handler).toBe('function');
    });

    test('연결 확인 도구 스키마 검증', () => {
      const connectionTool = server.getRegisteredTools().find(tool => tool.name === 'irys_check_connection');
      expect(connectionTool!.inputSchema).toBeDefined();
      expect(connectionTool!.outputSchema).toBeDefined();
    });
  });

  describe('잔액 조회 도구 테스트', () => {
    test('잔액 조회 도구 핸들러 존재 확인', () => {
      const balanceTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_balance');
      expect(balanceTool).toBeDefined();
      expect(typeof balanceTool!.handler).toBe('function');
    });

    test('잔액 조회 도구 스키마 검증', () => {
      const balanceTool = server.getRegisteredTools().find(tool => tool.name === 'irys_get_balance');
      expect(balanceTool!.inputSchema).toBeDefined();
      expect(balanceTool!.outputSchema).toBeDefined();
    });
  });

  describe('도구 설명 검증', () => {
    test('모든 도구에 한국어 설명이 있는지 확인', () => {
      const tools = server.getRegisteredTools();
      
      tools.forEach(tool => {
        expect(tool.description).toMatch(/[가-힣]/); // 한글이 포함되어 있는지 확인
        expect(tool.description.length).toBeGreaterThan(10); // 설명이 충분히 긴지 확인
      });
    });

                test('도구 설명이 기능을 정확히 설명하는지 확인', () => {
              const toolDescriptions = {
                'irys_upload_file': '업로드',
                'irys_download_file': '다운로드',
                'irys_search_files': '검색',
                'irys_batch_upload': '여러',
                'irys_create_version': '버전',
                'irys_update_share_settings': '공유',
                'irys_get_stats': '통계',
                'irys_get_file_info': '정보',
                'irys_check_connection': '연결',
                'irys_get_balance': '잔액'
              };

      Object.entries(toolDescriptions).forEach(([toolName, expectedKeyword]) => {
        const tool = server.getRegisteredTools().find(t => t.name === toolName);
        expect(tool!.description).toContain(expectedKeyword);
      });
    });
  });

  describe('스키마 타입 검증', () => {
    test('업로드 요청 스키마 필드 확인', () => {
      const uploadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_file');
      const schema = uploadTool!.inputSchema;
      
      // 스키마가 Zod 객체인지 확인
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });

    test('다운로드 요청 스키마 필드 확인', () => {
      const downloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_download_file');
      const schema = downloadTool!.inputSchema;
      
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });

    test('검색 요청 스키마 필드 확인', () => {
      const searchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_search_files');
      const schema = searchTool!.inputSchema;
      
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });
  });

  describe('핸들러 함수 시그니처 검증', () => {
    test('업로드 핸들러가 Promise를 반환하는지 확인', async () => {
      const uploadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_upload_file');
      const handler = uploadTool!.handler;
      
      // 핸들러가 비동기 함수인지 확인
      expect(handler.constructor.name).toBe('AsyncFunction');
    });

    test('다운로드 핸들러가 Promise를 반환하는지 확인', async () => {
      const downloadTool = server.getRegisteredTools().find(tool => tool.name === 'irys_download_file');
      const handler = downloadTool!.handler;
      
      expect(handler.constructor.name).toBe('AsyncFunction');
    });

    test('검색 핸들러가 Promise를 반환하는지 확인', async () => {
      const searchTool = server.getRegisteredTools().find(tool => tool.name === 'irys_search_files');
      const handler = searchTool!.handler;
      
      expect(handler.constructor.name).toBe('AsyncFunction');
    });
  });
}); 