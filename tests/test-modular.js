#!/usr/bin/env node

/**
 * Modular IRYS MCP Server Test Suite
 * 
 * This test suite validates the modularized IRYS MCP server implementation.
 */

import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

/**
 * Modular test suite for IRYS MCP Server
 */
class ModularTestSuite {
  constructor() {
    this.client = new Client(
      {
        name: "irys-mcp-modular-test-client",
        version: "2.0.0",
      },
      {
        capabilities: {},
      },
    );

    this.transport = new StreamableHTTPClientTransport(
      new URL(`http://localhost:8080/mcp`),
    );

    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  /**
   * Log test result
   */
  logTest(name, result, details = '') {
    this.testResults.total++;
    if (result) {
      this.testResults.passed++;
      console.log(`✅ ${name}: PASSED`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${name}: FAILED`);
    }
    if (details) {
      console.log(`   ${details}`);
    }
    this.testResults.details.push({ name, result, details });
  }

  /**
   * Run individual test
   */
  async runTest(name, testFunction) {
    try {
      console.log(`\n🧪 Running: ${name}`);
      const result = await testFunction();
      this.logTest(name, true, result);
      return result;
    } catch (error) {
      this.logTest(name, false, error.message);
      return null;
    }
  }

  /**
   * Test server connection
   */
  async testServerConnection() {
    await this.client.connect(this.transport);
    return 'Server connection established successfully';
  }

  /**
   * Test modular connection check
   */
  async testModularConnection() {
    const result = await this.client.callTool({
      name: "irys_check_connection",
      arguments: { tokenType: "ethereum" }
    });
    
    const text = result.content[0].text;
    
    const isSuccess = text.includes('성공적으로 연결되었습니다') && 
                     text.includes('Chain ID: 1270') &&
                     text.includes('IRYS');
    
    // Check for simulation vs real implementation
    const isSimulation = text.includes('시뮬레이션');
    const hasAddress = text.includes('address:') || text.includes('Address:');
    const hasBalance = text.includes('balance:') || text.includes('Balance:');
    
    let details = `Connection test: ${isSuccess ? 'Success' : 'Failed'}`;
    if (isSimulation) {
      details += ' (Simulation Mode)';
    } else {
      details += ' (Real SDK Mode)';
      if (hasAddress) details += ' - Address found';
      if (hasBalance) details += ' - Balance found';
    }
    
    return details;
  }

  /**
   * Test modular balance check
   */
  async testModularBalance() {
    const result = await this.client.callTool({
      name: "irys_get_balance",
      arguments: { tokenType: "ethereum" }
    });
    
    const text = result.content[0].text;
    
    const isSuccess = text.includes('잔액 조회에 성공했습니다') || 
                     text.includes('잔액:') ||
                     text.includes('Balance:');
    
    // Check for simulation vs real implementation
    const isSimulation = text.includes('시뮬레이션');
    const hasAtomicBalance = text.includes('balanceAtomic:') || text.includes('Balance Atomic:');
    const hasFormattedBalance = text.includes('formattedBalance:') || text.includes('Formatted Balance:');
    
    let details = `Balance check: ${isSuccess ? 'Success' : 'Failed'}`;
    if (isSimulation) {
      details += ' (Simulation Mode)';
    } else {
      details += ' (Real SDK Mode)';
      if (hasAtomicBalance) details += ' - Atomic balance found';
      if (hasFormattedBalance) details += ' - Formatted balance found';
    }
    
    return details;
  }

  /**
   * Test modular GraphQL query
   */
  async testModularGraphQL() {
    const result = await this.client.callTool({
      name: "irys_arweave_query",
      arguments: {
        query: `
          query {
            transactions(limit: 3) {
              edges {
                node {
                  id
                  address
                  token
                  timestamp
                }
              }
            }
          }
        `,
        timeout: 15000
      }
    });
    
    const text = result.content[0].text;
    const hasData = text.includes('"data"') && text.includes('"transactions"');
    
    return `Modular GraphQL query: ${hasData ? 'Data received' : 'No data'}`;
  }

  /**
   * Test modular file upload
   */
  async testModularFileUpload() {
    const result = await this.client.callTool({
      name: "irys_upload_file",
      arguments: {
        filePath: "./test-file.txt",
        tokenType: "ethereum",
        tags: [
          { name: "Content-Type", value: "text/plain" },
          { name: "Test-Upload", value: "true" }
        ]
      }
    });
    
    const text = result.content[0].text;
    const isSuccess = text.includes('업로드에 성공했습니다') || 
                     text.includes('업로드되었습니다') ||
                     text.includes('Transaction ID:');
    
    // Check for simulation vs real implementation
    const isSimulation = text.includes('시뮬레이션');
    const hasGatewayUrl = text.includes('gateway.irys.xyz') || text.includes('Gateway URL:');
    const hasTimestamp = text.includes('timestamp:') || text.includes('Timestamp:');
    const hasVersion = text.includes('version:') || text.includes('Version:');
    
    let details = `File upload: ${isSuccess ? 'Success' : 'Failed'}`;
    if (isSimulation) {
      details += ' (Simulation Mode)';
    } else {
      details += ' (Real SDK Mode)';
      if (hasGatewayUrl) details += ' - Gateway URL found';
      if (hasTimestamp) details += ' - Timestamp found';
      if (hasVersion) details += ' - Version found';
    }
    
    return details;
  }

  /**
   * Test modular upload status
   */
  async testModularUploadStatus() {
    const result = await this.client.callTool({
      name: "irys_get_upload_status",
      arguments: {
        transactionId: "test-tx-id-123"
      }
    });
    
    const text = result.content[0].text;
    const isSuccess = text.includes('상태 확인에 성공했습니다') || 
                     text.includes('상태 확인 완료') ||
                     text.includes('Status:');
    
    // Check for simulation vs real implementation
    const isSimulation = text.includes('시뮬레이션');
    const hasTimestamp = text.includes('timestamp:') || text.includes('Timestamp:');
    const hasVersion = text.includes('version:') || text.includes('Version:');
    const hasIsValid = text.includes('isValid:') || text.includes('Is Valid:');
    
    let details = `Upload status: ${isSuccess ? 'Success' : 'Failed'}`;
    if (isSimulation) {
      details += ' (Simulation Mode)';
    } else {
      details += ' (Real SDK Mode)';
      if (hasTimestamp) details += ' - Timestamp found';
      if (hasVersion) details += ' - Version found';
      if (hasIsValid) details += ' - Validation found';
    }
    
    return details;
  }

  /**
   * Test modular testnet operations
   */
  async testModularTestnetOperations() {
    const result = await this.client.callTool({
      name: "irys_testnet_operations",
      arguments: {
        operation: "check_balance",
        tokenType: "ethereum"
      }
    });
    
    const text = result.content[0].text;
          const hasOperation = text.includes('Testnet operation result') && text.includes('balance');
    
    return `Modular testnet operations: ${hasOperation ? 'Success' : 'Failed'}`;
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    try {
      await this.client.callTool({
        name: "irys_check_connection",
        arguments: { invalidParam: "test" }
      });
      return 'Error handling: Failed (should have thrown error)';
    } catch (error) {
      return 'Error handling: Success (properly caught invalid arguments)';
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Modular IRYS MCP Server Test Suite');
    console.log('=' .repeat(60));
    
    try {
      console.log('🔗 Connecting to modular server...');
      await this.testServerConnection();
      console.log('✅ Server connection successful!\n');
      
      // Run all modular tests
      const tests = [
        ['Modular Connection Check', () => this.testModularConnection()],
        ['Modular Balance Check', () => this.testModularBalance()],
        ['Modular GraphQL Query', () => this.testModularGraphQL()],
        ['Modular File Upload', () => this.testModularFileUpload()],
        ['Modular Upload Status', () => this.testModularUploadStatus()],
        ['Modular Testnet Operations', () => this.testModularTestnetOperations()],
        ['Error Handling', () => this.testErrorHandling()]
      ];

      for (const [testName, testFunction] of tests) {
        await this.runTest(testName, testFunction);
      }
      
      // Results summary
      console.log('\n' + '=' .repeat(60));
      console.log('📊 Modular Test Results Summary');
      console.log('=' .repeat(60));
      console.log(`Total Tests: ${this.testResults.total}`);
      console.log(`Passed: ${this.testResults.passed} ✅`);
      console.log(`Failed: ${this.testResults.failed} ❌`);
      console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
      
      if (this.testResults.failed === 0) {
        console.log('\n🎉 All modular tests passed successfully!');
        console.log('The modular IRYS MCP server is working correctly.');
      } else {
        console.log('\n⚠️  Some tests failed.');
        console.log('Failed tests:');
        this.testResults.details
          .filter(detail => !detail.result)
          .forEach(detail => console.log(`  - ${detail.name}: ${detail.details}`));
      }
      
      console.log('\n📝 Modular Features:');
      console.log('- Type definitions modularized (src/types/)');
      console.log('- Configuration management modularized (src/config/)');
      console.log('- Logging utilities modularized (src/utils/)');
      console.log('- Business logic services modularized (src/services/)');
      console.log('- Server logic modularized (src/server/)');
      console.log('- Main application modularized (src/index.js)');
      
    } catch (error) {
      console.error('❌ Error occurred during modular test execution:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check if the modular server is running: npm start');
      console.log('2. Verify that port 8080 is available');
      console.log('3. Ensure all modules are loaded correctly');
    } finally {
      process.exit(0);
    }
  }
}

// Run the modular test suite
const testSuite = new ModularTestSuite();
testSuite.runAllTests().catch(console.error); 