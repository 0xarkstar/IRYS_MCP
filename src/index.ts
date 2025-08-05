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

console.log('🚀 Starting Irys MCP Server...');
console.log('IRYS_PRIVATE_KEY=' + (privateKey ? 'Set' : 'Not set'));
console.log(`🌍 Network Type: ${networkType}`);
console.log(`🌐 Gateway URL: ${finalGatewayUrl}`);

// Create MCP server instances
const server = new IrysMCPServer(privateKey, finalGatewayUrl);
const advancedServer = new IrysAdvancedMCPServer(privateKey, 'ethereum', finalGatewayUrl);

// Start servers
server.start();
advancedServer.start();

console.log('✅ Irys MCP Server started successfully');
console.log('🚀 Starting Irys Advanced MCP Server...');
console.log('✅ Irys Advanced MCP Server started successfully');
