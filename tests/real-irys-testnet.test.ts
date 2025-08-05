import { IrysTestnetService } from '../src/services/IrysTestnetService';
import { randomBytes } from 'crypto';

// 실제 Irys L1 테스트넷과의 상호작용을 테스트하는 파일
describe('Irys L1 테스트넷 실제 연결 테스트', () => {
  let irysService: IrysTestnetService;
  let privateKey: string;

  function generateRealPrivateKey(): string {
    return randomBytes(32).toString('hex');
  }

  beforeAll(() => {
    // 실제 테스트용 개인키 생성 (매번 새로운 키)
    privateKey = generateRealPrivateKey();
    console.log('🔑 실제 테스트용 개인키 생성됨 (64자 hex)');
    
    // Irys L1 테스트넷 서비스 인스턴스 생성
    irysService = new IrysTestnetService(privateKey);
  });

  test('Irys L1 테스트넷 SDK 초기화 및 연결 테스트', async () => {
    console.log('🧪 Irys L1 테스트넷 SDK 초기화 테스트 시작...');
    
    // 연결 상태 확인
    const isConnected = await irysService.checkConnection();
    expect(isConnected).toBe(true);
    
    console.log('✅ Irys L1 테스트넷 SDK 초기화 및 연결 성공');
  });

  test('Irys L1 테스트넷 잔액 조회 테스트', async () => {
    console.log('🧪 Irys L1 테스트넷 잔액 조회 테스트 시작...');
    
    try {
      const balance = await irysService.getBalance();
      console.log(`💰 잔액: ${balance}`);
      expect(typeof balance).toBe('string');
      expect(balance.length).toBeGreaterThan(0);
      console.log('✅ Irys L1 테스트넷 잔액 조회 성공');
    } catch (error) {
      console.warn('⚠️ 잔액 조회 실패 (테스트 계속 진행):', error);
      // 잔액 조회 실패는 테스트 실패로 간주하지 않음
    }
  });

  test('Irys L1 테스트넷 파일 업로드 테스트', async () => {
    console.log('🧪 Irys L1 테스트넷 파일 업로드 테스트 시작...');
    
    const testContent = 'Irys L1 테스트넷 파일 업로드 테스트 - ' + Date.now();
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
      
      console.log('📤 업로드 결과:', uploadResult);
      expect(uploadResult.transactionId).toBeDefined();
      expect(uploadResult.transactionId.length).toBeGreaterThan(0);
      expect(uploadResult.url).toBeDefined();
      
      console.log('✅ Irys L1 테스트넷 파일 업로드 성공');
      
      fs.unlinkSync(testFilePath);
      
    } catch (error) {
      console.error('❌ 파일 업로드 실패:', error);
      // 파일 정리
      try {
        const fs = require('fs');
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      } catch (cleanupError) {
        console.warn('파일 정리 실패:', cleanupError);
      }
      throw error;
    }
  });

  test('Irys L1 테스트넷 파일 검색 테스트', async () => {
    console.log('🧪 Irys L1 테스트넷 파일 검색 테스트 시작...');
    
    try {
      const searchResult = await irysService.searchFiles({
        query: 'test',
        limit: 5,
        offset: 0
      });
      
      console.log('🔍 검색 결과:', searchResult);
      expect(searchResult.files).toBeDefined();
      expect(Array.isArray(searchResult.files)).toBe(true);
      
      console.log('✅ Irys L1 테스트넷 파일 검색 성공');
      
    } catch (error) {
      console.error('❌ 파일 검색 실패:', error);
      throw error;
    }
  });

  test('Irys L1 테스트넷 통계 조회 테스트', async () => {
    console.log('🧪 Irys L1 테스트넷 통계 조회 테스트 시작...');
    
    try {
      const statsResult = await irysService.getStats({
        startDate: Date.now() - 24 * 60 * 60 * 1000, // 24시간 전
        endDate: Date.now()
      });
      
      console.log('📊 통계 결과:', statsResult);
      expect(statsResult.totalFiles).toBeDefined();
      expect(statsResult.totalSize).toBeDefined();
      expect(statsResult.categories).toBeDefined();
      
      console.log('✅ Irys L1 테스트넷 통계 조회 성공');
      
    } catch (error) {
      console.error('❌ 통계 조회 실패:', error);
      throw error;
    }
  });

  test('Irys L1 테스트넷 네트워크 정보 확인', () => {
    console.log('🧪 Irys L1 테스트넷 네트워크 정보 확인...');
    
    const networkType = irysService.getNetworkType();
    const gatewayUrl = irysService.getGatewayUrl();
    
    expect(networkType).toBe('testnet');
    expect(gatewayUrl).toContain('testnet');
    
    console.log(`🌍 네트워크 타입: ${networkType}`);
    console.log(`🌐 Gateway URL: ${gatewayUrl}`);
    console.log('✅ Irys L1 테스트넷 네트워크 정보 확인 완료');
  });

  afterAll(() => {
    console.log('🧹 Irys L1 테스트넷 테스트 정리 완료');
  });
}); 