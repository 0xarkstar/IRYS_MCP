# IRYS MCP Server

A modular FastMCP-based IRYS L1 chain MCP server. IRYS is now an independent L1 chain, no longer associated with Arweave.

[한국어 문서 (Korean Documentation)](README.ko.md)

## 🚀 Features

- **Real IRYS SDK Integration**: Full integration with actual IRYS L1 blockchain
- **Multi-Token Support**: Ethereum, Solana, and Aptos token types
- **FastMCP Framework**: Built on FastMCP for optimal performance
- **Modular Architecture**: Clean, maintainable code structure
- **Auto-Detection**: Automatic private key format detection
- **GraphQL Support**: Direct blockchain data queries
- **File Upload**: Decentralized file storage on IRYS

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- IRYS private key (Ethereum, Solana, or Aptos format)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd irys-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # IRYS Configuration
   IRYS_PRIVATE_KEY=your_private_key_here
   IRYS_NETWORK=testnet
   
   # Server Configuration
   PORT=8080
   HOST=localhost
   
   # Timeouts
   TIMEOUT=30000
   GRAPHQL_TIMEOUT=10000
   
   # Development
   NODE_ENV=development
   SIMULATION_MODE=false
   ```

## 🚀 Quick Start

1. **Start the server**
   ```bash
   npm start
   ```

2. **Run tests**
   ```bash
   npm run test:modular
   ```

3. **Development mode**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── config/          # Configuration management
├── core/           # Core business logic
├── server/         # MCP server implementation
├── services/       # IRYS service layer
├── types/          # Type definitions and schemas
├── utils/          # Utility functions
└── index.js        # Main application entry point
```

## 🔧 Configuration

### Private Key Formats

The server automatically detects your private key format:

- **Ethereum**: `0x` + 64 hex characters
  ```
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
  ```

- **Solana**: 60-88 base58 characters
  ```
  4NwwJRJYVkqH3GJKR9rT3M9VnwzKqH3GJKR9rT3M9VnwzKqH3GJKR9rT3M9Vnwz
  ```

- **Aptos**: 64 hex characters (without 0x)
  ```
  1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
  ```

### Network Configuration

- **Testnet**: `testnet` (default)
  - RPC: `https://testnet-rpc.irys.xyz/v1/execution-rpc`
  - Explorer: `https://testnet-explorer.irys.xyz`
  - Wallet: `https://wallet.irys.xyz`

## 🧪 Testing

### Run All Tests
```bash
npm run test:modular
```

### Test Results
- ✅ Connection tests
- ✅ Balance checks
- ✅ GraphQL queries
- ✅ File uploads
- ✅ Upload status verification
- ✅ Testnet operations
- ✅ Error handling

## 🔌 MCP Tools

The server provides the following MCP tools:

### Core Tools
- `irys_check_connection` - Test IRYS network connection
- `irys_get_balance` - Get account balance
- `irys_execute_graphql` - Execute GraphQL queries
- `irys_upload_file` - Upload files to IRYS
- `irys_get_upload_status` - Check upload status
- `irys_testnet_operations` - Execute testnet operations

### Tool Parameters

#### Connection Check
```json
{
  "tokenType": "ethereum"
}
```

#### Balance Check
```json
{
  "tokenType": "ethereum",
  "address": "optional_address"
}
```

#### File Upload
```json
{
  "filePath": "/path/to/file.txt",
  "tokenType": "ethereum",
  "tags": [
    {"name": "Content-Type", "value": "text/plain"}
  ]
}
```

#### GraphQL Query
```json
{
  "query": "query { transactions(first: 1) { edges { node { id } } } }",
  "timeout": 10000
}
```

## 🔒 Security

- **Private Key Storage**: Store private keys in environment variables only
- **Network Validation**: All network requests are validated
- **Input Sanitization**: All inputs are sanitized and validated
- **Error Handling**: Comprehensive error handling without exposing sensitive data

## 🐛 Troubleshooting

### Common Issues

1. **Private Key Error**
   ```
   Error: IRYS_PRIVATE_KEY environment variable is required
   ```
   **Solution**: Add your private key to the `.env` file

2. **Network Connection Failed**
   ```
   Error: Connection check failed
   ```
   **Solution**: Check your internet connection and IRYS network status

3. **Invalid Token Type**
   ```
   Error: Unsupported token type
   ```
   **Solution**: Use one of: `ethereum`, `solana`, `aptos`

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm start
```

## 📚 API Reference

### IRYS Service Methods

- `checkConnection(tokenType)` - Test network connection
- `getBalance(tokenType, address)` - Get account balance
- `executeGraphQLQuery(query, timeout)` - Execute GraphQL queries
- `uploadFile(filePath, tokenType, tags)` - Upload files
- `getUploadStatus(transactionId)` - Check upload status
- `executeTestnetOperation(operation, tokenType)` - Testnet operations

### Configuration Methods

- `getNetworkConfig()` - Get network configuration
- `getDetectedTokenType()` - Get auto-detected token type
- `validate()` - Validate configuration
- `getSummary()` - Get configuration summary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [IRYS Documentation](https://docs.irys.xyz/)
- [FastMCP Documentation](https://github.com/fastmcp/fastmcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the configuration examples

---

**Note**: This server integrates with the actual IRYS L1 blockchain. Ensure you have sufficient funds for operations and understand the implications of blockchain transactions. 