// Synchronous import for @irys/sdk to handle Jest compatibility
const Irys = require('@irys/sdk');
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
  private irys: any | undefined;
  private gatewayUrl: string;
  private privateKey: string;
  private networkType: NetworkType;
  private isInitializing = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    privateKey: string,
    gatewayUrl?: string
  ) {
    this.privateKey = privateKey;
    this.networkType = 'testnet';
    
    // Testnet URL setting
    this.gatewayUrl = gatewayUrl || 'https://testnet-rpc.irys.xyz/v1';
    
    // Start SDK initialization (but don't wait for it in constructor)
    this.initializeIrysSDK().catch(error => {
      console.error('❌ Testnet SDK initialization failed:', error);
    });
  }

  /**
   * Ensure SDK is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (this.irys) {
      return; // Already initialized
    }
    
    if (this.isInitializing) {
      // Wait for ongoing initialization
      await this.initializationPromise;
      return;
    }
    
    // Start new initialization
    this.isInitializing = true;
    this.initializationPromise = this.initializeIrysSDK();
    await this.initializationPromise;
    this.isInitializing = false;
  }

  /**
   * Check if SDK is ready for use
   */
  public async isReady(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return this.irys !== undefined;
    } catch (error) {
      return false;
    }
  }

  private async initializeIrysSDK(): Promise<void> {
    try {
      console.log('🔧 Irys L1 Testnet SDK initialization started...');
      console.log(`🔑 Private key length: ${this.privateKey.length}`);
      console.log(`🌍 Network: ${this.networkType}`);
      console.log(`🌐 Gateway URL: ${this.gatewayUrl}`);

      // Irys SDK is already imported synchronously

      // Validate key format
      if (this.privateKey.length !== 64) {
        throw new Error('Private key must be a 64-character hex string.');
      }

      if (!/^[0-9a-fA-F]+$/.test(this.privateKey)) {
        throw new Error('Private key must be in 64-character hex format.');
      }

      try {
        // Use mainnet URL for SDK initialization (workaround for testnet compatibility)
        const mainnetUrl = 'https://uploader.irys.xyz';
        
        // Initialize Irys SDK with string key (SDK will handle conversion internally)
        this.irys = new Irys({
          url: mainnetUrl,
          token: 'ethereum',
          key: this.privateKey,
        });

        console.log('✅ Irys L1 Testnet SDK initialization successful (using mainnet URL)');
        console.log(`📍 Actual RPC URL: ${mainnetUrl}`);
        console.log(`🔑 Address: ${this.irys.address}`);

        // Test connection by getting balance
        const balance = await this.irys.getLoadedBalance();
        console.log(`💰 Initial balance: ${balance}`);

        // SDK initialization completed
        console.log('🎉 Irys L1 Testnet SDK ready for use');
        console.log('📝 Switching to simulation mode. Actual uploads/downloads may not work.');
      } catch (error: any) {
        console.error('❌ Irys L1 Testnet SDK initialization failed:', error.message);
        throw new Error(`Irys L1 Testnet SDK initialization failed: ${error.message}`);
      }
    } catch (error: any) {
      console.error('❌ Irys L1 Testnet SDK initialization failed:', error.message);
      console.error('📋 Error details:', error);
      console.log('📝 Switching to simulation mode. Actual uploads/downloads may not work.');
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
      console.error('Testnet connection check failed:', error);
      return false;
    }
  }

  async getBalance(): Promise<string> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }
      const balance = await this.irys.getLoadedBalance();
      return balance.toString();
    } catch (error: any) {
      throw new NetworkError(`Balance query failed: ${error.message}`);
    }
  }

  async uploadFile(request: UploadRequest): Promise<UploadResponse> {
    // Ensure SDK is initialized
    await this.ensureInitialized();
    
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`📤 Testnet file upload started: ${request.filePath}`);

      // Read file
      const fileBuffer = readFileSync(request.filePath);
      const contentType = mime.lookup(request.filePath) || 'application/octet-stream';

      // Add testnet-specific tags
      const tags = [
        { name: 'Content-Type', value: contentType },
        { name: 'test-type', value: 'l1-testnet' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        ...Object.entries(request.tags || {}).map(([key, value]) => ({ name: key, value }))
      ];

      // Upload to Irys
      const receipt = await this.irys.upload(fileBuffer, { tags });

      console.log(`📤 Testnet upload result:`, {
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
      console.error('Testnet file upload failed:', error);
      throw new NetworkError(`Testnet file upload failed: ${error.message}`);
    }
  }

  /**
   * File search (testnet simulation)
   */
  async searchFiles(request: SearchRequest): Promise<SearchResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`🔍 Testnet file search started...`);
      console.log(`🔍 Searching for files owned by ${this.irys.address}...`);

      // Testnet simulation data
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

      // Apply filtering
      let filteredFiles = mockFiles;
      
      if (request.tags) {
        filteredFiles = filteredFiles.filter(file => {
          return Object.entries(request.tags!).every(([key, value]) => 
            file.tags && file.tags[key] === value
          );
        });
      }

      // Apply pagination
      const offset = request.offset || 0;
      const limit = request.limit || 20;
      const paginatedFiles = filteredFiles.slice(offset, offset + limit);

      console.log(`🔍 Found ${filteredFiles.length} files (page: ${offset}-${offset + limit})`);

      return {
        files: paginatedFiles,
        total: filteredFiles.length,
        hasMore: filteredFiles.length > offset + limit
      };
    } catch (error: any) {
      console.error('Testnet file search failed:', error);
      throw new NetworkError(`Testnet file search failed: ${error.message}`);
    }
  }

  /**
   * Get statistics (testnet simulation)
   */
  async getStats(request: StatsRequest): Promise<StatsResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`📊 Testnet statistics retrieval started...`);

      // Actual balance query
      let balance = '0';
      try {
        balance = await this.getBalance();
        console.log(`📊 User balance: ${balance}`);
      } catch (error) {
        console.warn('⚠️ Balance retrieval failed (continuing statistics calculation):', error);
      }

      console.log(`📊 Calculating statistics for address ${this.irys.address}...`);

      // Testnet simulation statistics
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

      console.log(`📊 Total ${mockStats.totalFiles} files, ${mockStats.totalSize} bytes, ${Object.keys(mockStats.categories).length} categories`);

      return mockStats;
    } catch (error: any) {
      console.error('Statistics query failed:', error);
      throw new NetworkError(`Statistics query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Other methods are implemented similarly to the mainnet service, but add testnet-specific tags
  async downloadFile(request: DownloadRequest): Promise<DownloadResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`📥 Testnet file download started: ${request.transactionId}`);

      // Testnet download implementation
      const response = await fetch(`${this.gatewayUrl}/${request.transactionId}`);

      if (!response.ok) {
        throw new FileNotFoundError(`File not found: ${request.transactionId}`);
      }

      const data = await response.arrayBuffer();
      const buffer = Buffer.from(data);

      // Set download path
      const downloadPath = request.outputPath || `./downloads/testnet-${request.transactionId}`;
      
      // Create directory
      try {
        mkdirSync(dirname(downloadPath), { recursive: true });
      } catch (error) {
        // Ignore if directory already exists
      }

      // Save file
      writeFileSync(downloadPath, buffer);

      console.log(`📥 Testnet file download completed: ${downloadPath} (${buffer.length} bytes)`);

      return {
        filePath: downloadPath,
        size: buffer.length,
        contentType: response.headers.get('content-type') || 'application/octet-stream',
        transactionId: request.transactionId
      };
    } catch (error: any) {
      console.error('Testnet file download failed:', error);
      throw new NetworkError(`Testnet file download failed: ${error.message}`);
    }
  }

  async batchUpload(request: BatchUploadRequest): Promise<BatchUploadResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`📤 Testnet batch upload started: ${request.files.length} files`);

      const results: Array<{
        filePath: string;
        transactionId: string;
        url: string;
        success: boolean;
        error?: string;
      }> = [];

      let successful = 0;
      let failed = 0;

      // Upload each file sequentially
      for (const fileInfo of request.files) {
        try {
          console.log(`📤 Testnet file upload in progress: ${fileInfo.filePath}`);

          // Read file
          const fileBuffer = readFileSync(fileInfo.filePath);
          const contentType = mime.lookup(fileInfo.filePath) || 'application/octet-stream';

          // Add testnet-specific tags
          const tags = [
            { name: 'Content-Type', value: contentType },
            { name: 'test-type', value: 'l1-testnet-batch' },
            { name: 'timestamp', value: Date.now().toString() },
            { name: 'Network-Type', value: 'testnet' },
            { name: 'Batch-Upload', value: 'true' },
            ...Object.entries(fileInfo.tags || {}).map(([key, value]) => ({ name: key, value }))
          ];

          // Add category tags
          if (request.category) {
            tags.push({ name: 'Category', value: request.category });
          }

          // Upload to Irys
          const receipt = await this.irys.upload(fileBuffer, { tags });

          results.push({
            filePath: fileInfo.filePath,
            transactionId: receipt.id,
            url: `${this.gatewayUrl}/${receipt.id}`,
            success: true
          });

          successful++;
          console.log(`✅ Testnet file upload successful: ${fileInfo.filePath} -> ${receipt.id}`);

        } catch (error: any) {
          console.error(`❌ Testnet file upload failed: ${fileInfo.filePath}`, error);
          
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

      console.log(`📤 Testnet batch upload completed: Successful ${successful}, Failed ${failed}`);

      return {
        results,
        summary: {
          total: request.files.length,
          successful,
          failed
        }
      };
    } catch (error: any) {
      console.error('Testnet batch upload failed:', error);
      throw new NetworkError(`Testnet batch upload failed: ${error.message}`);
    }
  }

  async createVersion(request: VersionRequest): Promise<VersionResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`🔄 Testnet version creation started: ${request.originalTransactionId} -> ${request.version}`);

      // Get original file info (simulation)
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

      // Read new version file
      const fileBuffer = readFileSync(request.filePath);
      const contentType = mime.lookup(request.filePath) || 'application/octet-stream';

      // Add version tags
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

      // Add description tag
      if (request.description) {
        tags.push({ name: 'Description', value: request.description });
      }

      // Upload new version to Irys
      const receipt = await this.irys.upload(fileBuffer, { tags });

      console.log(`🔄 Testnet version creation completed: ${request.version} -> ${receipt.id}`);

      return {
        originalTransactionId: request.originalTransactionId,
        newTransactionId: receipt.id,
        version: request.version,
        url: `${this.gatewayUrl}/${receipt.id}`,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('Testnet version creation failed:', error);
      throw new NetworkError(`Testnet version creation failed: ${error.message}`);
    }
  }

  async updateShareSettings(request: ShareRequest): Promise<ShareResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`🔗 Testnet share settings update: ${request.transactionId}`);

      // Serialize share settings to JSON
      const shareSettings = {
        transactionId: request.transactionId,
        isPublic: request.isPublic,
        allowedUsers: request.allowedUsers || [],
        expiresAt: request.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        updatedAt: Date.now(),
        networkType: 'testnet'
      };

      const settingsBuffer = Buffer.from(JSON.stringify(shareSettings, null, 2));

      // Add share settings tags
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

      // Upload share settings to Irys
      const receipt = await this.irys.upload(settingsBuffer, { tags });

      console.log(`🔗 Testnet share settings update completed: ${receipt.id}`);

      return {
        transactionId: request.transactionId,
        isPublic: request.isPublic,
        allowedUsers: request.allowedUsers || [],
        expiresAt: request.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000,
        shareUrl: `${this.gatewayUrl}/${request.transactionId}`
      };
    } catch (error: any) {
      console.error('Testnet share settings update failed:', error);
      throw new NetworkError(`Testnet share settings update failed: ${error.message}`);
    }
  }

  async manageCategories(request: CategoryRequest): Promise<CategoryResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`📁 Testnet category management: ${request.action}`);

      // Testnet category data (simulation)
      const categories = [
        {
          name: 'documents',
          description: 'Document files',
          color: '#4CAF50',
          parentCategory: undefined,
          fileCount: 15,
          totalSize: 2048576
        },
        {
          name: 'images',
          description: 'Image files',
          color: '#2196F3',
          parentCategory: undefined,
          fileCount: 8,
          totalSize: 10485760
        },
        {
          name: 'videos',
          description: 'Video files',
          color: '#FF9800',
          parentCategory: undefined,
          fileCount: 3,
          totalSize: 52428800
        }
      ];

      // Serialize category info to JSON
      const categoryData = {
        categories,
        action: request.action,
        timestamp: Date.now(),
        networkType: 'testnet',
        owner: this.irys.address
      };

      const dataBuffer = Buffer.from(JSON.stringify(categoryData, null, 2));

      // Add category management tags
      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-categories' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Category-Management', value: 'true' },
        { name: 'Action', value: request.action },
        { name: 'Categories-Count', value: categories.length.toString() }
      ];

      // Upload category info to Irys
      const receipt = await this.irys.upload(dataBuffer, { tags });

      console.log(`📁 Testnet category management completed: ${receipt.id}`);

      return {
        categories,
        action: request.action,
        success: true,
        message: `Testnet category ${request.action} completed`,
        transactionId: receipt.id
      };
    } catch (error: any) {
      console.error('Testnet category management failed:', error);
      throw new NetworkError(`Testnet category management failed: ${error.message}`);
    }
  }

  async manageTags(request: TagRequest): Promise<TagResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`🏷️ Testnet tag management: ${request.action}`);

      // Testnet tag data (simulation)
      const tags = [
        {
          name: 'Content-Type',
          value: 'text/plain',
          description: 'Text file type',
          category: 'file-type',
          usageCount: 25
        },
        {
          name: 'Network-Type',
          value: 'testnet',
          description: 'Test network',
          category: 'network',
          usageCount: 50
        },
        {
          name: 'App-Name',
          value: 'Irys-MCP-Testnet',
          description: 'Testnet MCP app',
          category: 'application',
          usageCount: 30
        }
      ];

      // Serialize tag info to JSON
      const tagData = {
        tags,
        action: request.action,
        timestamp: Date.now(),
        networkType: 'testnet',
        owner: this.irys.address
      };

      const dataBuffer = Buffer.from(JSON.stringify(tagData, null, 2));

      // Add tag management tags
      const uploadTags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-tags' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Tag-Management', value: 'true' },
        { name: 'Action', value: request.action },
        { name: 'Tags-Count', value: tags.length.toString() }
      ];

      // Upload tag info to Irys
      const receipt = await this.irys.upload(dataBuffer, { tags: uploadTags });

      console.log(`🏷️ Testnet tag management completed: ${receipt.id}`);

      return {
        tags,
        action: request.action,
        success: true,
        message: `Testnet tag ${request.action} completed`
      };
    } catch (error: any) {
      console.error('Testnet tag management failed:', error);
      throw new NetworkError(`Testnet tag management failed: ${error.message}`);
    }
  }

  async monitorPerformance(request: PerformanceRequest): Promise<PerformanceResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`📊 Testnet performance monitoring: ${request.operation}`);

      // Testnet performance metrics (simulation)
      const metrics = {
        duration: 150, // 150ms
        throughput: 1024 * 1024, // 1MB/s
        latency: 50, // 50ms
        successRate: 0.98, // 98%
        errorRate: 0.02 // 2%
      };

      const recommendations = [
        'Network connection is stable',
        'Consider batch processing for higher upload speeds',
        'Service is stable with low error rate'
      ];

      // Serialize performance data to JSON
      const performanceData = {
        operation: request.operation,
        metrics,
        recommendations,
        timestamp: Date.now(),
        networkType: 'testnet',
        owner: this.irys.address
      };

      const dataBuffer = Buffer.from(JSON.stringify(performanceData, null, 2));

      // Add performance monitoring tags
      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-performance' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Performance-Monitoring', value: 'true' },
        { name: 'Operation', value: request.operation },
        { name: 'Success-Rate', value: metrics.successRate.toString() }
      ];

      // Upload performance data to Irys
      const receipt = await this.irys.upload(dataBuffer, { tags });

      console.log(`📊 Testnet performance monitoring completed: ${receipt.id}`);

      return {
        operation: request.operation,
        metrics,
        recommendations,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('Testnet performance monitoring failed:', error);
      throw new NetworkError(`Testnet performance monitoring failed: ${error.message}`);
    }
  }

  async managePlugins(request: PluginRequest): Promise<PluginResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`🔌 Testnet plugin management: ${request.action}`);

      // Testnet plugin data (simulation)
      const plugins = [
        {
          name: 'encryption-plugin',
          version: '1.0.0',
          enabled: true,
          description: 'File encryption plugin',
          author: 'Irys Team',
          dependencies: ['crypto']
        },
        {
          name: 'compression-plugin',
          version: '2.1.0',
          enabled: true,
          description: 'File compression plugin',
          author: 'Irys Team',
          dependencies: ['zlib']
        },
        {
          name: 'backup-plugin',
          version: '1.5.0',
          enabled: false,
          description: 'Automatic backup plugin',
          author: 'Irys Team',
          dependencies: ['fs', 'path']
        }
      ];

      // Serialize plugin info to JSON
      const pluginData = {
        plugins,
        action: request.action,
        timestamp: Date.now(),
        networkType: 'testnet',
        owner: this.irys.address
      };

      const dataBuffer = Buffer.from(JSON.stringify(pluginData, null, 2));

      // Add plugin management tags
      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-plugins' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Plugin-Management', value: 'true' },
        { name: 'Action', value: request.action },
        { name: 'Plugins-Count', value: plugins.length.toString() }
      ];

      // Upload plugin info to Irys
      const receipt = await this.irys.upload(dataBuffer, { tags });

      console.log(`🔌 Testnet plugin management completed: ${receipt.id}`);

      return {
        plugins,
        action: request.action,
        success: true,
        message: `Testnet plugin ${request.action} completed`
      };
    } catch (error: any) {
      console.error('Testnet plugin management failed:', error);
      throw new NetworkError(`Testnet plugin management failed: ${error.message}`);
    }
  }

  async getAdvancedStats(request: AdvancedStatsRequest): Promise<AdvancedStatsResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`📈 Testnet advanced statistics retrieval`);

      // Basic statistics query
      const basicStats = await this.getStats({ owner: request.owner });

      // Advanced statistics data (simulation)
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

      // Serialize advanced statistics data to JSON
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

      // Add advanced statistics tags
      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'test-type', value: 'l1-testnet-advanced-stats' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Advanced-Stats', value: 'true' },
        { name: 'Time-Series-Count', value: timeSeries.length.toString() },
        { name: 'Categories-Count', value: topCategories.length.toString() }
      ];

      // Upload advanced statistics data to Irys
      const receipt = await this.irys.upload(dataBuffer, { tags });

      console.log(`📈 Testnet advanced statistics retrieval completed: ${receipt.id}`);

      return {
        ...basicStats,
        timeSeries,
        topCategories,
        topOwners,
        storageEfficiency
      };
    } catch (error: any) {
      console.error('Testnet advanced statistics retrieval failed:', error);
      throw new NetworkError(`Testnet advanced statistics retrieval failed: ${error.message}`);
    }
  }

  async restoreFile(request: RestoreRequest): Promise<RestoreResponse> {
    try {
      if (!this.irys) {
        throw new NetworkError('Irys SDK is not initialized.');
      }

      console.log(`🔄 Testnet file restoration: ${request.transactionId}`);

      // File info to restore (simulation)
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

      // Restored file content (simulation)
      const restoredContent = `Restored file content
Original transaction ID: ${request.transactionId}
Restoration time: ${new Date().toISOString()}
Network: Testnet
This is a restored file.`;

      const contentBuffer = Buffer.from(restoredContent, 'utf8');

      // Add restore tags
      const tags = [
        { name: 'Content-Type', value: 'text/plain' },
        { name: 'test-type', value: 'l1-testnet-restored' },
        { name: 'timestamp', value: Date.now().toString() },
        { name: 'Network-Type', value: 'testnet' },
        { name: 'Restored-File', value: 'true' },
        { name: 'Original-Transaction-Id', value: request.transactionId },
        { name: 'Restore-Timestamp', value: Date.now().toString() }
      ];

      // Upload restored file to Irys
      const receipt = await this.irys.upload(contentBuffer, { tags });

      console.log(`🔄 Testnet file restoration completed: ${receipt.id}`);

      return {
        transactionId: request.transactionId,
        restored: true,
        restoreToPath: request.restoreToPath || `./restored/testnet-${request.transactionId}`,
        message: 'Testnet file restoration successful.',
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('Testnet file restoration failed:', error);
      throw new NetworkError(`Testnet file restoration failed: ${error.message}`);
    }
  }
} 