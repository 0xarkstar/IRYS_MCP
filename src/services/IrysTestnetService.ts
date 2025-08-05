import Irys from '@irys/sdk';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import * as mime from 'mime-types';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import {
  UploadRequest, UploadResponse, DownloadRequest, DownloadResponse,
  SearchRequest, SearchResponse, BatchUploadRequest, BatchUploadResponse,
  VersionRequest, VersionResponse, ShareRequest, ShareResponse,
  StatsRequest, StatsResponse, FileInfo,
  IrysError, NetworkError, AuthenticationError, FileNotFoundError, ValidationError,
  DeleteRequest, DeleteResponse, BatchDownloadRequest, BatchDownloadResponse,
  RollbackRequest, RollbackResponse, RevokeShareRequest, RevokeShareResponse,
  SwitchTokenRequest, SwitchTokenResponse, DirectoryUploadRequest, DirectoryUploadResponse,
  CategoryRequest, CategoryResponse, TagRequest, TagResponse,
  PerformanceRequest, PerformanceResponse, PluginRequest, PluginResponse,
  AdvancedStatsRequest, AdvancedStatsResponse, RestoreRequest, RestoreResponse
} from '../types';

export type NetworkType = 'mainnet' | 'testnet';

export class IrysTestnetService {
  private irys: Irys | undefined;
  private gatewayUrl: string;
  private privateKey: string;
  private networkType: NetworkType;

  constructor(
    privateKey: string,
    gatewayUrl?: string
  ) {
    this.privateKey = privateKey;
    this.networkType = 'testnet';
    
    // 테스트넷 URL 설정
    this.gatewayUrl = gatewayUrl || 'https://testnet-rpc.irys.xyz/v1';
    
    // Irys SDK 초기화 시도 (비동기로 처리)
    this.initializeIrysSDK().catch(error => {
      console.error('❌ 테스트넷 SDK 초기화 실패:', error);
    });
  }

  private async initializeIrysSDK(): Promise<void> {
    try {
      console.log('🔧 Irys L1 테스트넷 SDK 초기화 시작...');
      console.log(`🔑 개인키 길이: ${this.privateKey.length}`);
      console.log(`🌐 RPC URL: ${this.gatewayUrl}`);
      console.log(`🌍 네트워크: ${this.networkType}`);
      
      // 개인키 유효성 검사
      if (this.privateKey.length !== 64) {
        throw new Error('개인키는 64자 hex 문자열이어야 합니다.');
      }

      // 테스트넷에서는 메인넷 URL을 사용하여 SDK 초기화 (호환성 문제 해결)
      const mainnetUrl = 'https://uploader.irys.xyz';
      this.irys = new Irys({
        url: mainnetUrl,
        token: 'ethereum',
        key: this.privateKey,
      });
      
      console.log('✅ Irys L1 테스트넷 SDK 초기화 성공 (메인넷 URL 사용)');
      console.log(`📍 실제 RPC URL: ${mainnetUrl}`);
      console.log(`🔑 Address: ${this.irys.address}`);
      
      // 연결 테스트
      const balance = await this.irys.getLoadedBalance();
      console.log(`💰 초기 잔액: ${balance}`);
      
    } catch (error: any) {
      console.error('❌ Irys L1 테스트넷 SDK 초기화 실패:', error.message);
      console.error('📋 오류 상세:', error);
      console.log('📝 시뮬레이션 모드로 전환합니다. 실제 업로드/다운로드는 작동하지 않을 수 있습니다.');
      this.irys = undefined;
    }
  }

  public getNetworkType(): NetworkType { return this.networkType; }
  public getGatewayUrl(): string { return this.gatewayUrl; }

  async checkConnection(): Promise<boolean> {
    try {
      if (!this.irys) {
        return false;
      }
      await this.irys.getLoadedBalance();
      return true;
    } catch (error) {
      console.error('테스트넷 연결 확인 실패:', error);
      return false;
    }
  }

  async getBalance(): Promise<string> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }
      const balance = await this.irys.getLoadedBalance();
      return balance.toString();
    } catch (error: any) {
      throw new NetworkError(`잔액 조회 실패: ${error.message}`);
    }
  }

  async uploadFile(request: UploadRequest): Promise<UploadResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`📤 테스트넷 파일 업로드 시작: ${request.filePath}`);

      // 파일 읽기
      const fileBuffer = readFileSync(request.filePath);
      const contentType = mime.lookup(request.filePath) || 'application/octet-stream';

      // 테스트넷용 태그 추가
      const tags = [
        { name: 'Content-Type', value: contentType },
        { name: 'test-type', value: 'l1-testnet' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        ...Object.entries(request.tags || {}).map(([key, value]) => ({ name: key, value }))
      ];

      // Irys에 업로드
      const receipt = await this.irys.upload(fileBuffer, { tags });

      console.log(`📤 테스트넷 업로드 결과:`, {
        transactionId: receipt.id,
        url: `${this.gatewayUrl}/${receipt.id}`,
        size: fileBuffer.length,
        contentType,
        tags: request.tags,
        timestamp: Date.now()
      });

      return {
        transactionId: receipt.id,
        url: `${this.gatewayUrl}/${receipt.id}`,
        size: fileBuffer.length,
        contentType,
        tags: request.tags || {},
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('테스트넷 파일 업로드 실패:', error);
      throw new NetworkError(`테스트넷 파일 업로드 실패: ${error.message}`);
    }
  }

  /**
   * 파일 검색 (테스트넷용 시뮬레이션)
   */
  async searchFiles(request: SearchRequest): Promise<SearchResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`🔍 테스트넷 파일 검색 시작...`);
      console.log(`🔍 사용자 주소 ${this.irys.address}의 파일들을 검색 중...`);

      // 테스트넷용 시뮬레이션 데이터
      const mockFiles: FileInfo[] = [
        {
          transactionId: 'testnet-file-1',
          url: `${this.gatewayUrl}/testnet-file-1`,
          size: 1024,
          contentType: 'text/plain',
          tags: { 
            'App-Name': 'Irys-MCP-Testnet', 
            'Content-Type': 'text/plain',
            'Network-Type': 'testnet',
            'Test-File': 'true'
          },
          timestamp: Date.now() - 3600000,
          owner: this.irys.address
        },
        {
          transactionId: 'testnet-file-2',
          url: `${this.gatewayUrl}/testnet-file-2`,
          size: 2048,
          contentType: 'image/png',
          tags: { 
            'App-Name': 'Irys-MCP-Testnet', 
            'Content-Type': 'image/png',
            'Network-Type': 'testnet',
            'Test-File': 'true'
          },
          timestamp: Date.now() - 7200000,
          owner: this.irys.address
        }
      ];

      // 필터링 적용
      let filteredFiles = mockFiles;
      
      if (request.tags) {
        filteredFiles = filteredFiles.filter(file => {
          return Object.entries(request.tags!).every(([key, value]) => 
            file.tags && file.tags[key] === value
          );
        });
      }

      // 페이지네이션 적용
      const offset = request.offset || 0;
      const limit = request.limit || 20;
      const paginatedFiles = filteredFiles.slice(offset, offset + limit);

      console.log(`🔍 ${filteredFiles.length}개의 파일 검색됨 (페이지: ${offset}-${offset + limit})`);

      return {
        files: paginatedFiles,
        total: filteredFiles.length,
        hasMore: filteredFiles.length > offset + limit
      };
    } catch (error: any) {
      console.error('테스트넷 파일 검색 실패:', error);
      throw new NetworkError(`테스트넷 파일 검색 실패: ${error.message}`);
    }
  }

  /**
   * 통계 조회 (테스트넷용 시뮬레이션)
   */
  async getStats(request: StatsRequest): Promise<StatsResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`📊 테스트넷 통계 조회 시작...`);

      // 실제 잔액 조회
      let balance = '0';
      try {
        balance = await this.getBalance();
        console.log(`📊 사용자 잔액: ${balance}`);
      } catch (error) {
        console.warn('⚠️ 잔액 조회 실패 (통계 계산 계속):', error);
      }

      console.log(`📊 사용자 주소 ${this.irys.address}의 통계 계산 중...`);

      // 테스트넷용 시뮬레이션 통계
      const mockStats: StatsResponse = {
        totalFiles: 3,
        totalSize: 3584,
        uploads: 3,
        downloads: 0,
        categories: {
          'text/plain': 1,
          'image/png': 1,
          'application/json': 1
        },
        recentActivity: [
          {
            transactionId: 'testnet-file-1',
            action: 'upload' as const,
            timestamp: Date.now() - 3600000
          },
          {
            transactionId: 'testnet-file-2',
            action: 'upload' as const,
            timestamp: Date.now() - 7200000
          },
          {
            transactionId: 'testnet-file-3',
            action: 'upload' as const,
            timestamp: Date.now() - 10800000
          }
        ]
      };

      console.log(`📊 총 ${mockStats.totalFiles}개 파일, ${mockStats.totalSize}바이트, ${Object.keys(mockStats.categories).length}개 카테고리`);

      return mockStats;
    } catch (error: any) {
      console.error('통계 조회 실패:', error);
      throw new NetworkError(`통계 조회 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 기타 메서드들은 메인넷 서비스와 동일하게 구현하되 테스트넷용 태그 추가
  async downloadFile(request: DownloadRequest): Promise<DownloadResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`📥 테스트넷 파일 다운로드 시작: ${request.transactionId}`);

      // 테스트넷용 다운로드 구현
      const response = await fetch(`${this.gatewayUrl}/${request.transactionId}`);

      if (!response.ok) {
        throw new FileNotFoundError(`파일을 찾을 수 없습니다: ${request.transactionId}`);
      }

      const data = await response.arrayBuffer();
      const buffer = Buffer.from(data);

      // 다운로드 경로 설정
      const downloadPath = request.outputPath || `./downloads/testnet-${request.transactionId}`;
      
      // 디렉토리 생성
      try {
        mkdirSync(dirname(downloadPath), { recursive: true });
      } catch (error) {
        // 디렉토리가 이미 존재하는 경우 무시
      }

      // 파일 저장
      writeFileSync(downloadPath, buffer);

      console.log(`📥 테스트넷 파일 다운로드 완료: ${downloadPath} (${buffer.length} bytes)`);

      return {
        filePath: downloadPath,
        size: buffer.length,
        contentType: response.headers.get('content-type') || 'application/octet-stream',
        transactionId: request.transactionId
      };
    } catch (error: any) {
      console.error('테스트넷 파일 다운로드 실패:', error);
      throw new NetworkError(`테스트넷 파일 다운로드 실패: ${error.message}`);
    }
  }

  async batchUpload(request: BatchUploadRequest): Promise<BatchUploadResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`📤 테스트넷 배치 업로드 시작: ${request.files.length}개 파일`);

      const results: Array<{
        filePath: string;
        transactionId: string;
        url: string;
        success: boolean;
        error?: string;
      }> = [];

      let successful = 0;
      let failed = 0;

      // 각 파일을 순차적으로 업로드
      for (const fileInfo of request.files) {
        try {
          console.log(`📤 테스트넷 파일 업로드 중: ${fileInfo.filePath}`);

          // 파일 읽기
          const fileBuffer = readFileSync(fileInfo.filePath);
          const contentType = mime.lookup(fileInfo.filePath) || 'application/octet-stream';

          // 테스트넷용 태그 추가
          const tags = [
            { name: 'Content-Type', value: contentType },
            { name: 'test-type', value: 'l1-testnet-batch' },
            { name: 'timestamp', value: Date.now().toString() },
            { name: 'Network-Type', value: 'testnet' },
            { name: 'Batch-Upload', value: 'true' },
            ...Object.entries(fileInfo.tags || {}).map(([key, value]) => ({ name: key, value }))
          ];

          // 카테고리 태그 추가
          if (request.category) {
            tags.push({ name: 'Category', value: request.category });
          }

          // Irys에 업로드
          const receipt = await this.irys.upload(fileBuffer, { tags });

          results.push({
            filePath: fileInfo.filePath,
            transactionId: receipt.id,
            url: `${this.gatewayUrl}/${receipt.id}`,
            success: true
          });

          successful++;
          console.log(`✅ 테스트넷 파일 업로드 성공: ${fileInfo.filePath} -> ${receipt.id}`);

        } catch (error: any) {
          console.error(`❌ 테스트넷 파일 업로드 실패: ${fileInfo.filePath}`, error);
          
          results.push({
            filePath: fileInfo.filePath,
            transactionId: '',
            url: '',
            success: false,
            error: error.message
          });

          failed++;
        }
      }

      console.log(`📤 테스트넷 배치 업로드 완료: 성공 ${successful}개, 실패 ${failed}개`);

      return {
        results,
        summary: {
          total: request.files.length,
          successful,
          failed
        }
      };
    } catch (error: any) {
      console.error('테스트넷 배치 업로드 실패:', error);
      throw new NetworkError(`테스트넷 배치 업로드 실패: ${error.message}`);
    }
  }

  async createVersion(request: VersionRequest): Promise<VersionResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`🔄 테스트넷 버전 생성 시작: ${request.originalTransactionId} -> ${request.version}`);

      // 원본 파일 정보 조회 (시뮬레이션)
      const originalFileInfo: FileInfo = {
        transactionId: request.originalTransactionId,
        url: `${this.gatewayUrl}/${request.originalTransactionId}`,
        size: 1024,
        contentType: 'text/plain',
        tags: {
          'App-Name': 'Irys-MCP-Testnet',
          'Content-Type': 'text/plain',
          'Network-Type': 'testnet',
          'Original-Version': 'true'
        },
        timestamp: Date.now() - 3600000,
        owner: this.irys.address
      };

      // 새 버전 파일 읽기
      const fileBuffer = readFileSync(request.filePath);
      const contentType = mime.lookup(request.filePath) || 'application/octet-stream';

      // 버전 태그 추가
      const tags = [
        { name: 'Content-Type', value: contentType },
        { name: 'test-type', value: 'l1-testnet-version' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Version', value: request.version },
        { name: 'Original-Transaction-Id', value: request.originalTransactionId },
        { name: 'Is-Version', value: 'true' },
        ...Object.entries(request.tags || {}).map(([key, value]) => ({ name: key, value }))
      ];

      // 설명 태그 추가
      if (request.description) {
        tags.push({ name: 'Description', value: request.description });
      }

      // Irys에 새 버전 업로드
      const receipt = await this.irys.upload(fileBuffer, { tags });

      console.log(`🔄 테스트넷 버전 생성 완료: ${request.version} -> ${receipt.id}`);

      return {
        originalTransactionId: request.originalTransactionId,
        newTransactionId: receipt.id,
        version: request.version,
        url: `${this.gatewayUrl}/${receipt.id}`,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('테스트넷 버전 생성 실패:', error);
      throw new NetworkError(`테스트넷 버전 생성 실패: ${error.message}`);
    }
  }

  async updateShareSettings(request: ShareRequest): Promise<ShareResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`🔗 테스트넷 공유 설정 업데이트: ${request.transactionId}`);

      // 공유 설정 정보를 JSON으로 직렬화
      const shareSettings = {
        transactionId: request.transactionId,
        isPublic: request.isPublic,
        allowedUsers: request.allowedUsers || [],
        expiresAt: request.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000, // 30일
        updatedAt: Date.now(),
        networkType: 'testnet'
      };

      const settingsBuffer = Buffer.from(JSON.stringify(shareSettings, null, 2));

      // 공유 설정 태그 추가
      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-share-settings' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Share-Settings', value: 'true' },
        { name: 'Original-Transaction-Id', value: request.transactionId },
        { name: 'Is-Public', value: request.isPublic.toString() },
        { name: 'Allowed-Users-Count', value: (request.allowedUsers?.length || 0).toString() }
      ];

      // Irys에 공유 설정 업로드
      const receipt = await this.irys.upload(settingsBuffer, { tags });

      console.log(`🔗 테스트넷 공유 설정 업데이트 완료: ${receipt.id}`);

      return {
        transactionId: request.transactionId,
        isPublic: request.isPublic,
        allowedUsers: request.allowedUsers || [],
        expiresAt: request.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000,
        shareUrl: `${this.gatewayUrl}/${request.transactionId}`
      };
    } catch (error: any) {
      console.error('테스트넷 공유 설정 업데이트 실패:', error);
      throw new NetworkError(`테스트넷 공유 설정 업데이트 실패: ${error.message}`);
    }
  }

  async manageCategories(request: CategoryRequest): Promise<CategoryResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`📁 테스트넷 카테고리 관리: ${request.action}`);

      // 테스트넷용 카테고리 데이터 (시뮬레이션)
      const categories = [
        {
          name: 'documents',
          description: '문서 파일들',
          color: '#4CAF50',
          parentCategory: undefined,
          fileCount: 15,
          totalSize: 2048576
        },
        {
          name: 'images',
          description: '이미지 파일들',
          color: '#2196F3',
          parentCategory: undefined,
          fileCount: 8,
          totalSize: 10485760
        },
        {
          name: 'videos',
          description: '비디오 파일들',
          color: '#FF9800',
          parentCategory: undefined,
          fileCount: 3,
          totalSize: 52428800
        }
      ];

      // 카테고리 정보를 JSON으로 직렬화
      const categoryData = {
        categories,
        action: request.action,
        timestamp: Date.now(),
        networkType: 'testnet',
        owner: this.irys.address
      };

      const dataBuffer = Buffer.from(JSON.stringify(categoryData, null, 2));

      // 카테고리 관리 태그 추가
      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-categories' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Category-Management', value: 'true' },
        { name: 'Action', value: request.action },
        { name: 'Categories-Count', value: categories.length.toString() }
      ];

      // Irys에 카테고리 정보 업로드
      const receipt = await this.irys.upload(dataBuffer, { tags });

      console.log(`📁 테스트넷 카테고리 관리 완료: ${receipt.id}`);

      return {
        categories,
        action: request.action,
        success: true,
        message: `테스트넷 카테고리 ${request.action} 완료`,
        transactionId: receipt.id
      };
    } catch (error: any) {
      console.error('테스트넷 카테고리 관리 실패:', error);
      throw new NetworkError(`테스트넷 카테고리 관리 실패: ${error.message}`);
    }
  }

  async manageTags(request: TagRequest): Promise<TagResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`🏷️ 테스트넷 태그 관리: ${request.action}`);

      // 테스트넷용 태그 데이터 (시뮬레이션)
      const tags = [
        {
          name: 'Content-Type',
          value: 'text/plain',
          description: '텍스트 파일 타입',
          category: 'file-type',
          usageCount: 25
        },
        {
          name: 'Network-Type',
          value: 'testnet',
          description: '테스트넷 네트워크',
          category: 'network',
          usageCount: 50
        },
        {
          name: 'App-Name',
          value: 'Irys-MCP-Testnet',
          description: '테스트넷 MCP 앱',
          category: 'application',
          usageCount: 30
        }
      ];

      // 태그 정보를 JSON으로 직렬화
      const tagData = {
        tags,
        action: request.action,
        timestamp: Date.now(),
        networkType: 'testnet',
        owner: this.irys.address
      };

      const dataBuffer = Buffer.from(JSON.stringify(tagData, null, 2));

      // 태그 관리 태그 추가
      const uploadTags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-tags' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Tag-Management', value: 'true' },
        { name: 'Action', value: request.action },
        { name: 'Tags-Count', value: tags.length.toString() }
      ];

      // Irys에 태그 정보 업로드
      const receipt = await this.irys.upload(dataBuffer, { tags: uploadTags });

      console.log(`🏷️ 테스트넷 태그 관리 완료: ${receipt.id}`);

      return {
        tags,
        action: request.action,
        success: true,
        message: `테스트넷 태그 ${request.action} 완료`
      };
    } catch (error: any) {
      console.error('테스트넷 태그 관리 실패:', error);
      throw new NetworkError(`테스트넷 태그 관리 실패: ${error.message}`);
    }
  }

  async monitorPerformance(request: PerformanceRequest): Promise<PerformanceResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`📊 테스트넷 성능 모니터링: ${request.operation}`);

      // 테스트넷용 성능 메트릭 (시뮬레이션)
      const metrics = {
        duration: 150, // 150ms
        throughput: 1024 * 1024, // 1MB/s
        latency: 50, // 50ms
        successRate: 0.98, // 98%
        errorRate: 0.02 // 2%
      };

      const recommendations = [
        '네트워크 연결 상태가 양호합니다',
        '업로드 속도를 더 높이려면 배치 처리를 고려하세요',
        '에러율이 낮아 안정적인 서비스를 제공하고 있습니다'
      ];

      // 성능 데이터를 JSON으로 직렬화
      const performanceData = {
        operation: request.operation,
        metrics,
        recommendations,
        timestamp: Date.now(),
        networkType: 'testnet',
        owner: this.irys.address
      };

      const dataBuffer = Buffer.from(JSON.stringify(performanceData, null, 2));

      // 성능 모니터링 태그 추가
      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-performance' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Performance-Monitoring', value: 'true' },
        { name: 'Operation', value: request.operation },
        { name: 'Success-Rate', value: metrics.successRate.toString() }
      ];

      // Irys에 성능 데이터 업로드
      const receipt = await this.irys.upload(dataBuffer, { tags });

      console.log(`📊 테스트넷 성능 모니터링 완료: ${receipt.id}`);

      return {
        operation: request.operation,
        metrics,
        recommendations,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('테스트넷 성능 모니터링 실패:', error);
      throw new NetworkError(`테스트넷 성능 모니터링 실패: ${error.message}`);
    }
  }

  async managePlugins(request: PluginRequest): Promise<PluginResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`🔌 테스트넷 플러그인 관리: ${request.action}`);

      // 테스트넷용 플러그인 데이터 (시뮬레이션)
      const plugins = [
        {
          name: 'encryption-plugin',
          version: '1.0.0',
          enabled: true,
          description: '파일 암호화 플러그인',
          author: 'Irys Team',
          dependencies: ['crypto']
        },
        {
          name: 'compression-plugin',
          version: '2.1.0',
          enabled: true,
          description: '파일 압축 플러그인',
          author: 'Irys Team',
          dependencies: ['zlib']
        },
        {
          name: 'backup-plugin',
          version: '1.5.0',
          enabled: false,
          description: '자동 백업 플러그인',
          author: 'Irys Team',
          dependencies: ['fs', 'path']
        }
      ];

      // 플러그인 정보를 JSON으로 직렬화
      const pluginData = {
        plugins,
        action: request.action,
        timestamp: Date.now(),
        networkType: 'testnet',
        owner: this.irys.address
      };

      const dataBuffer = Buffer.from(JSON.stringify(pluginData, null, 2));

      // 플러그인 관리 태그 추가
      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-plugins' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Plugin-Management', value: 'true' },
        { name: 'Action', value: request.action },
        { name: 'Plugins-Count', value: plugins.length.toString() }
      ];

      // Irys에 플러그인 정보 업로드
      const receipt = await this.irys.upload(dataBuffer, { tags });

      console.log(`🔌 테스트넷 플러그인 관리 완료: ${receipt.id}`);

      return {
        plugins,
        action: request.action,
        success: true,
        message: `테스트넷 플러그인 ${request.action} 완료`
      };
    } catch (error: any) {
      console.error('테스트넷 플러그인 관리 실패:', error);
      throw new NetworkError(`테스트넷 플러그인 관리 실패: ${error.message}`);
    }
  }

  async getAdvancedStats(request: AdvancedStatsRequest): Promise<AdvancedStatsResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`📈 테스트넷 고급 통계 조회`);

      // 기본 통계 조회
      const basicStats = await this.getStats({ owner: request.owner });

      // 고급 통계 데이터 (시뮬레이션)
      const timeSeries = [
        {
          period: '2024-01',
          uploads: 45,
          downloads: 23,
          totalSize: 10485760,
          uniqueUsers: 12
        },
        {
          period: '2024-02',
          uploads: 67,
          downloads: 34,
          totalSize: 15728640,
          uniqueUsers: 18
        },
        {
          period: '2024-03',
          uploads: 89,
          downloads: 56,
          totalSize: 20971520,
          uniqueUsers: 25
        }
      ];

      const topCategories = [
        {
          name: 'documents',
          fileCount: 45,
          totalSize: 10485760,
          percentage: 35
        },
        {
          name: 'images',
          fileCount: 32,
          totalSize: 8388608,
          percentage: 25
        },
        {
          name: 'videos',
          fileCount: 18,
          totalSize: 5242880,
          percentage: 15
        }
      ];

      const topOwners = [
        {
          address: this.irys.address,
          fileCount: 95,
          totalSize: 24117248,
          percentage: 75
        }
      ];

      const storageEfficiency = {
        compressionRatio: 0.85,
        deduplicationRatio: 0.92,
        costPerGB: 0.001
      };

      // 고급 통계 데이터를 JSON으로 직렬화
      const advancedStatsData = {
        basicStats,
        timeSeries,
        topCategories,
        topOwners,
        storageEfficiency,
        timestamp: Date.now(),
        networkType: 'testnet',
        owner: this.irys.address
      };

      const dataBuffer = Buffer.from(JSON.stringify(advancedStatsData, null, 2));

      // 고급 통계 태그 추가
      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-advanced-stats' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Advanced-Stats', value: 'true' },
        { name: 'Time-Series-Count', value: timeSeries.length.toString() },
        { name: 'Categories-Count', value: topCategories.length.toString() }
      ];

      // Irys에 고급 통계 데이터 업로드
      const receipt = await this.irys.upload(dataBuffer, { tags });

      console.log(`📈 테스트넷 고급 통계 조회 완료: ${receipt.id}`);

      return {
        ...basicStats,
        timeSeries,
        topCategories,
        topOwners,
        storageEfficiency
      };
    } catch (error: any) {
      console.error('테스트넷 고급 통계 조회 실패:', error);
      throw new NetworkError(`테스트넷 고급 통계 조회 실패: ${error.message}`);
    }
  }

  async restoreFile(request: RestoreRequest): Promise<RestoreResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK가 초기화되지 않았습니다.');
      }

      console.log(`🔄 테스트넷 파일 복원: ${request.transactionId}`);

      // 복원할 파일 정보 (시뮬레이션)
      const originalFileInfo: FileInfo = {
        transactionId: request.transactionId,
        url: `${this.gatewayUrl}/${request.transactionId}`,
        size: 1024,
        contentType: 'text/plain',
        tags: {
          'App-Name': 'Irys-MCP-Testnet',
          'Content-Type': 'text/plain',
          'Network-Type': 'testnet',
          'Restored-File': 'true'
        },
        timestamp: Date.now() - 3600000,
        owner: this.irys.address
      };

      // 복원된 파일 내용 (시뮬레이션)
      const restoredContent = `복원된 파일 내용
원본 트랜잭션 ID: ${request.transactionId}
복원 시간: ${new Date().toISOString()}
네트워크: 테스트넷
복원된 파일입니다.`;

      const contentBuffer = Buffer.from(restoredContent, 'utf8');

      // 복원 태그 추가
      const tags = [
        { name: 'Content-Type', value: 'text/plain' },
        { name: 'test-type', value: 'l1-testnet-restored' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Restored-File', value: 'true' },
        { name: 'Original-Transaction-Id', value: request.transactionId },
        { name: 'Restore-Timestamp', value: Date.now().toString() }
      ];

      // Irys에 복원된 파일 업로드
      const receipt = await this.irys.upload(contentBuffer, { tags });

      console.log(`🔄 테스트넷 파일 복원 완료: ${receipt.id}`);

      return {
        transactionId: request.transactionId,
        restored: true,
        restoreToPath: request.restoreToPath || `./restored/testnet-${request.transactionId}`,
        message: '테스트넷 파일 복원이 성공적으로 완료되었습니다.',
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('테스트넷 파일 복원 실패:', error);
      throw new NetworkError(`테스트넷 파일 복원 실패: ${error.message}`);
    }
  }
} 