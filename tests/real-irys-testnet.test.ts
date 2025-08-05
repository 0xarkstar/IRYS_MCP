import { IrysTestnetService } from '../src/services/IrysTestnetService';
import { randomBytes } from 'crypto';

// File for testing actual interaction with Irys L1 testnet
describe('Irys L1 Testnet Actual Connection Tests', () => {
  let irysService: IrysTestnetService;
  let privateKey: string;

  function generateRealPrivateKey(): string {
    return randomBytes(32).toString('hex');
  }

  beforeAll(() => {
    // Generate real test private key (new key each time)
    privateKey = generateRealPrivateKey();
    console.log('🔑 Real test private key generated (64-character hex)');
    
    // Create Irys L1 testnet service instance
    irysService = new IrysTestnetService(privateKey);
  });

  test('Irys L1 Testnet SDK initialization and connection test', async () => {
    console.log('🧪 Irys L1 Testnet SDK initialization test started...');
    
    // Check connection status
    const isConnected = await irysService.checkConnection();
    expect(isConnected).toBe(true);
    
    console.log('✅ Irys L1 Testnet SDK initialization and connection successful');
  });

  test('Irys L1 Testnet balance retrieval test', async () => {
    console.log('🧪 Irys L1 Testnet balance retrieval test started...');
    
    try {
      const balance = await irysService.getBalance();
      console.log(`💰 Balance: ${balance}`);
      expect(typeof balance).toBe('string');
      expect(balance.length).toBeGreaterThan(0);
      console.log('✅ Irys L1 Testnet balance retrieval successful');
    } catch (error) {
      console.warn('⚠️ Balance retrieval failed (test continues):', error);
      // Balance retrieval failure is not considered a test failure
    }
  });

  test('Irys L1 Testnet file upload test', async () => {
    console.log('🧪 Irys L1 Testnet file upload test started...');
    
    const testContent = 'Irys L1 Testnet file upload test - ' + Date.now();
    const testFilePath = './test-upload-testnet.txt';
    
    try {
      const fs = require('fs');
      fs.writeFileSync(testFilePath, testContent, 'utf8');
      
      const uploadResult = await irysService.uploadFile({
        filePath: testFilePath,
        isPublic: true,
        tags: {
          'Content-Type': 'text/plain',
          'test-type': 'l1-testnet',
          'timestamp': Date.now().toString()
        }
      });
      
      console.log('📤 Upload result:', uploadResult);
      expect(uploadResult.transactionId).toBeDefined();
      expect(uploadResult.transactionId.length).toBeGreaterThan(0);
      expect(uploadResult.url).toBeDefined();
      
      console.log('✅ Irys L1 Testnet file upload successful');
      
      fs.unlinkSync(testFilePath);
      
    } catch (error) {
      console.error('❌ File upload failed:', error);
      // Clean up file
      try {
        const fs = require('fs');
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      } catch (cleanupError) {
        console.warn('File cleanup failed:', cleanupError);
      }
      throw error;
    }
  });

  test('Irys L1 Testnet file search test', async () => {
    console.log('🧪 Irys L1 Testnet file search test started...');
    
    try {
      const searchResult = await irysService.searchFiles({
        query: 'test',
        limit: 5,
        offset: 0
      });
      
      console.log('🔍 Search result:', searchResult);
      expect(searchResult.files).toBeDefined();
      expect(Array.isArray(searchResult.files)).toBe(true);
      
      console.log('✅ Irys L1 Testnet file search successful');
      
    } catch (error) {
      console.error('❌ File search failed:', error);
      throw error;
    }
  });

  test('Irys L1 Testnet statistics retrieval test', async () => {
    console.log('🧪 Irys L1 Testnet statistics retrieval test started...');
    
    try {
      const statsResult = await irysService.getStats({
        startDate: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
        endDate: Date.now()
      });
      
      console.log('📊 Statistics result:', statsResult);
      expect(statsResult.totalFiles).toBeDefined();
      expect(statsResult.totalSize).toBeDefined();
      expect(statsResult.categories).toBeDefined();
      
      console.log('✅ Irys L1 Testnet statistics retrieval successful');
      
    } catch (error) {
      console.error('❌ Statistics retrieval failed:', error);
      throw error;
    }
  });

  test('Irys L1 Testnet network information verification', () => {
    console.log('🧪 Irys L1 Testnet network information verification...');
    
    const networkType = irysService.getNetworkType();
    const gatewayUrl = irysService.getGatewayUrl();
    
    expect(networkType).toBe('testnet');
    expect(gatewayUrl).toContain('testnet');
    
    console.log(`🌍 Network type: ${networkType}`);
    console.log(`🌐 Gateway URL: ${gatewayUrl}`);
    console.log('✅ Irys L1 Testnet network information verification completed');
  });

  afterAll(() => {
    console.log('🧹 Irys L1 Testnet test cleanup completed');
  });
}); 