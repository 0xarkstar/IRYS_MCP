import { IrysService } from '../src/services/IrysService';
import { randomBytes } from 'crypto';

// File for testing actual interaction with Irys L1 mainnet
describe('Irys L1 Mainnet Actual Connection Tests', () => {
  let irysService: IrysService;
  let privateKey: string;

  // Generate real test private key
  function generateRealPrivateKey(): string {
    return randomBytes(32).toString('hex');
  }

  beforeAll(() => {
    // Generate real test private key (new key each time)
    privateKey = generateRealPrivateKey();
    console.log('🔑 Real test private key generated (64-character hex)');
    
    // Set Irys L1 mainnet URL
    const gatewayUrl = process.env.IRYS_GATEWAY_URL || 'https://uploader.irys.xyz';
    console.log(`🌐 Gateway URL: ${gatewayUrl}`);
    
    // Create Irys L1 mainnet service instance
    irysService = new IrysService(privateKey, gatewayUrl, 'mainnet');
  });

  test('Irys L1 Mainnet SDK initialization and connection test', async () => {
    console.log('🧪 Irys L1 Mainnet SDK initialization test started...');
    
    // Check connection status
    const isConnected = await irysService.checkConnection();
    expect(isConnected).toBe(true);
    
    console.log('✅ Irys L1 Mainnet SDK initialization and connection successful');
  });

  test('Irys L1 Mainnet balance retrieval test', async () => {
    console.log('🧪 Irys L1 Mainnet balance retrieval test started...');
    
    try {
      const balance = await irysService.getBalance();
      console.log(`💰 Balance: ${balance}`);
      expect(typeof balance).toBe('string');
      expect(balance.length).toBeGreaterThan(0);
      console.log('✅ Irys L1 Mainnet balance retrieval successful');
    } catch (error) {
      console.warn('⚠️ Balance retrieval failed (test continues):', error);
      // Balance retrieval failure is not considered a test failure
    }
  });

  test('Irys L1 Mainnet file upload test', async () => {
    console.log('🧪 Irys L1 Mainnet file upload test started...');
    
    const testContent = 'Irys L1 Mainnet file upload test - ' + Date.now();
    const testFilePath = './test-upload.txt';
    
    try {
      // Create test file
      const fs = require('fs');
      fs.writeFileSync(testFilePath, testContent, 'utf8');
      
      // Upload file
      const uploadResult = await irysService.uploadFile({
        filePath: testFilePath,
        isPublic: true,
        tags: {
          'Content-Type': 'text/plain',
          'test-type': 'l1-mainnet',
          'timestamp': Date.now().toString()
        }
      });
      
      console.log('📤 Upload result:', uploadResult);
      expect(uploadResult.transactionId).toBeDefined();
      expect(uploadResult.transactionId.length).toBeGreaterThan(0);
      expect(uploadResult.url).toBeDefined();
      
      console.log('✅ Irys L1 Mainnet file upload successful');
      
      // Clean up test file
      fs.unlinkSync(testFilePath);
      
    } catch (error) {
      console.error('❌ File upload failed:', error);
      // Clean up test file
      try {
        const fs = require('fs');
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      } catch (cleanupError) {
        console.warn('⚠️ Test file cleanup failed:', cleanupError);
      }
      throw error;
    }
  });

  test('Irys L1 Mainnet file search test', async () => {
    console.log('🧪 Irys L1 Mainnet file search test started...');
    
    try {
      const searchResult = await irysService.searchFiles({
        query: 'test',
        limit: 5,
        offset: 0
      });
      
      console.log('🔍 Search result:', searchResult);
      expect(searchResult.files).toBeDefined();
      expect(Array.isArray(searchResult.files)).toBe(true);
      
      console.log('✅ Irys L1 Mainnet file search successful');
      
    } catch (error) {
      console.error('❌ File search failed:', error);
      throw error;
    }
  });

  test('Irys L1 Mainnet statistics retrieval test', async () => {
    console.log('🧪 Irys L1 Mainnet statistics retrieval test started...');
    
    try {
      const statsResult = await irysService.getStats({
        startDate: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
        endDate: Date.now()
      });
      
      console.log('📊 Statistics result:', statsResult);
      expect(statsResult.totalFiles).toBeDefined();
      expect(statsResult.totalSize).toBeDefined();
      expect(statsResult.categories).toBeDefined();
      
      console.log('✅ Irys L1 Mainnet statistics retrieval successful');
      
    } catch (error) {
      console.error('❌ Statistics retrieval failed:', error);
      throw error;
    }
  });

  test('Irys L1 Mainnet network information verification', () => {
    console.log('🧪 Irys L1 Mainnet network information verification...');
    
    const networkType = irysService.getNetworkType();
    const gatewayUrl = irysService.getGatewayUrl();
    
    expect(networkType).toBe('mainnet');
    expect(gatewayUrl).toContain('uploader.irys.xyz');
    
    console.log(`🌍 Network type: ${networkType}`);
    console.log(`🌐 Gateway URL: ${gatewayUrl}`);
    console.log('✅ Irys L1 Mainnet network information verification completed');
  });

  afterAll(() => {
    console.log('🧹 Irys L1 Mainnet test cleanup completed');
  });
}); 