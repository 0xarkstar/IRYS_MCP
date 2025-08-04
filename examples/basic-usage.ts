import { IrysMCPServer } from '../src/server/IrysMCPServer';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

async function basicUsageExample() {
  console.log('🚀 Irys MCP 기본 사용 예제를 시작합니다...\n');

  // 환경변수에서 개인키 가져오기
  const privateKey = process.env.IRYS_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ IRYS_PRIVATE_KEY 환경변수가 설정되지 않았습니다.');
    return;
  }

  // MCP 서버 생성
  const server = new IrysMCPServer(privateKey);

  try {
    // 1. 연결 상태 확인
    console.log('1️⃣ 연결 상태 확인...');
    const connectionResult = await server.irysService.checkConnection();
    console.log(`   연결 상태: ${connectionResult ? '✅ 연결됨' : '❌ 연결 안됨'}`);

    if (connectionResult) {
      const balance = await server.irysService.getBalance();
      console.log(`   현재 잔액: ${balance} AR\n`);
    }

    // 2. 테스트 파일 생성
    console.log('2️⃣ 테스트 파일 생성...');
    const testFilePath = join(__dirname, 'test-file.txt');
    const testContent = `안녕하세요! 이것은 Irys MCP 테스트 파일입니다.
생성 시간: ${new Date().toISOString()}
테스트 내용: Irys 분산 스토리지 네트워크에 업로드되는 파일입니다.`;

    writeFileSync(testFilePath, testContent, 'utf8');
    console.log(`   테스트 파일 생성: ${testFilePath}\n`);

    // 3. 파일 업로드
    console.log('3️⃣ 파일 업로드...');
    const uploadResult = await server.irysService.uploadFile({
      filePath: testFilePath,
      tags: {
        type: 'test',
        description: 'MCP 테스트 파일',
        category: 'example',
      },
      description: 'Irys MCP 기본 사용 예제용 테스트 파일',
      category: 'examples',
      isPublic: true,
    });

    console.log('   ✅ 업로드 성공!');
    console.log(`   트랜잭션 ID: ${uploadResult.transactionId}`);
    console.log(`   파일 URL: ${uploadResult.url}`);
    console.log(`   파일 크기: ${uploadResult.size} bytes`);
    console.log(`   콘텐츠 타입: ${uploadResult.contentType}\n`);

    // 4. 파일 정보 조회
    console.log('4️⃣ 파일 정보 조회...');
    const fileInfo = await server.irysService.getFileInfo(uploadResult.transactionId);
    console.log('   ✅ 파일 정보 조회 성공!');
    console.log(`   소유자: ${fileInfo.owner}`);
    console.log(`   업로드 시간: ${new Date(fileInfo.timestamp).toLocaleString()}\n`);

    // 5. 파일 다운로드
    console.log('5️⃣ 파일 다운로드...');
    const downloadResult = await server.irysService.downloadFile({
      transactionId: uploadResult.transactionId,
      outputPath: join(__dirname, 'downloaded-test-file.txt'),
    });

    console.log('   ✅ 다운로드 성공!');
    console.log(`   저장 경로: ${downloadResult.filePath}`);
    console.log(`   다운로드 크기: ${downloadResult.size} bytes\n`);

    // 6. 파일 검색 (시뮬레이션)
    console.log('6️⃣ 파일 검색...');
    const searchResult = await server.irysService.searchFiles({
      query: 'test',
      tags: { type: 'test' },
      limit: 10,
    });

    console.log('   ✅ 검색 완료!');
    console.log(`   검색된 파일 수: ${searchResult.total}`);
    console.log(`   더 많은 결과: ${searchResult.hasMore ? '예' : '아니오'}\n`);

    // 7. 통계 정보 조회
    console.log('7️⃣ 통계 정보 조회...');
    const statsResult = await server.irysService.getStats({
      startDate: Date.now() - 24 * 60 * 60 * 1000, // 24시간 전부터
    });

    console.log('   ✅ 통계 조회 완료!');
    console.log(`   총 파일 수: ${statsResult.totalFiles}`);
    console.log(`   총 크기: ${statsResult.totalSize} bytes`);
    console.log(`   업로드 수: ${statsResult.uploads}`);
    console.log(`   다운로드 수: ${statsResult.downloads}\n`);

    console.log('🎉 모든 예제가 성공적으로 완료되었습니다!');

  } catch (error) {
    console.error('❌ 예제 실행 중 오류가 발생했습니다:', error);
  } finally {
    // 정리 작업
    try {
      const testFilePath = join(__dirname, 'test-file.txt');
      const downloadedFilePath = join(__dirname, 'downloaded-test-file.txt');

      if (require('fs').existsSync(testFilePath)) {
        unlinkSync(testFilePath);
        console.log('🧹 테스트 파일 정리 완료');
      }

      if (require('fs').existsSync(downloadedFilePath)) {
        unlinkSync(downloadedFilePath);
        console.log('🧹 다운로드 파일 정리 완료');
      }
    } catch (cleanupError) {
      console.warn('⚠️  파일 정리 중 오류:', cleanupError);
    }
  }
}

// 예제 실행
if (require.main === module) {
  basicUsageExample().catch((error) => {
    console.error('❌ 예상치 못한 오류가 발생했습니다:', error);
    process.exit(1);
  });
}

export { basicUsageExample }; 