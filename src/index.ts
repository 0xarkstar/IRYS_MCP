#!/usr/bin/env node

import { IrysMCPServer } from './server/IrysMCPServer';
import { IrysAdvancedMCPServer } from './server/IrysAdvancedMCPServer';
import { NetworkType } from './services/IrysService';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// 환경 변수에서 설정 가져오기
const privateKey = process.env.IRYS_PRIVATE_KEY || 'test-private-key';
const networkType = (process.env.IRYS_NETWORK as NetworkType) || 'mainnet';
const gatewayUrl = process.env.IRYS_GATEWAY_URL;

// 네트워크 타입에 따른 기본 URL 설정
const getDefaultUrl = (network: NetworkType): string => {
  switch (network) {
    case 'testnet':
      return 'https://testnet-rpc.irys.xyz/v1';
    case 'mainnet':
    default:
      return 'https://uploader.irys.xyz';
  }
};

const finalGatewayUrl = gatewayUrl || getDefaultUrl(networkType);

console.log('🚀 Irys MCP 서버 시작 중...');
console.log('IRYS_PRIVATE_KEY=' + (privateKey ? '설정됨' : '설정되지 않음'));
console.log(`IRYS_NETWORK=${networkType}`);
console.log(`IRYS_GATEWAY_URL=${finalGatewayUrl} (Irys L1 ${networkType === 'testnet' ? '테스트넷' : '메인넷'})`);

// MCP 서버 인스턴스 생성
const server = new IrysMCPServer(privateKey, finalGatewayUrl);
const advancedServer = new IrysAdvancedMCPServer(privateKey, 'ethereum', finalGatewayUrl);

// 서버 시작
server.start();
advancedServer.start();
