#!/usr/bin/env node

import { IrysMCPServer } from './server/IrysMCPServer';
import { config } from 'dotenv';

// Load environment variables
config();

async function main() {
  try {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    const gatewayUrl = process.env.IRYS_GATEWAY_URL || 'https://node2.irys.xyz';

    if (!privateKey) {
      console.error('❌ IRYS_PRIVATE_KEY environment variable is not set.');
      console.log('📝 Please add the following to your .env file:');
      console.log('IRYS_PRIVATE_KEY=your-private-key-here');
      console.log('IRYS_GATEWAY_URL=https://node2.irys.xyz (optional)');
      process.exit(1);
    }

    const server = new IrysMCPServer(privateKey, gatewayUrl);
    await server.start();

    console.log('🎉 Irys MCP server started successfully!');
    console.log('\n--- Available Tools List ---');
    server.getRegisteredTools().forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });
    console.log('---------------------------\n');

    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\nSIGINT signal received, shutting down server...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nSIGTERM signal received, shutting down server...');
      await server.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error occurred while starting server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error in main:', error);
    process.exit(1);
  });
}

export { IrysMCPServer }; 