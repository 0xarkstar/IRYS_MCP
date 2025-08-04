# Irys MCP (Model Context Protocol)

A comprehensive Model Context Protocol (MCP) implementation for Irys decentralized storage network, built with TypeScript.

## Features

### Core Features
- **File Upload/Download**: Upload and download files to/from Irys network
- **File Search**: Search files using GraphQL queries
- **Batch Operations**: Upload and download multiple files efficiently
- **Version Management**: Create and manage file versions
- **Share Management**: Control file sharing and access permissions

### Advanced Features
- **Encryption**: Client-side file encryption/decryption with AES-256-CBC
- **Data Contracts**: Conditional access control based on time, balance, or user lists
- **Multi-token Support**: Support for Ethereum, Solana, Aptos, and Arweave tokens
- **Directory Upload**: Recursively upload entire directories
- **Category & Tag Management**: Organize files with categories and tags
- **Performance Monitoring**: Track upload/download performance metrics
- **Plugin System**: Extensible plugin architecture
- **Advanced Statistics**: Detailed analytics and reporting

### File Management
- **File Deletion**: Mark files as deleted (Irys doesn't support actual deletion)
- **File Restoration**: Restore previously deleted files
- **Batch Download**: Download multiple files simultaneously
- **Version Rollback**: Rollback to previous file versions

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
IRYS_PRIVATE_KEY=your-private-key-here
IRYS_GATEWAY_URL=https://node2.irys.xyz
```

### Private Key Types
- **Ethereum**: `0x...` hex string
- **Solana**: Base58 encoded string
- **Aptos**: Hex string
- **Arweave**: JSON key file content

## Usage

### Start the MCP Server

```bash
npm run dev
```

### Build and Run

```bash
npm run build
npm start
```

## API Tools

The MCP server provides 29 tools for AI model interaction:

### File Operations
- `irys_upload_file`: Upload a file to Irys network
- `irys_download_file`: Download a file from Irys network
- `irys_search_files`: Search files using various criteria
- `irys_delete_file`: Mark a file as deleted
- `irys_restore_file`: Restore a deleted file

### Batch Operations
- `irys_batch_upload`: Upload multiple files
- `irys_batch_download`: Download multiple files

### Version Management
- `irys_create_version`: Create a new file version
- `irys_rollback_version`: Rollback to a previous version

### Encryption
- `irys_encrypt_file`: Encrypt a local file
- `irys_decrypt_file`: Decrypt a local file
- `irys_upload_encrypted_file`: Upload an encrypted file
- `irys_download_encrypted_file`: Download and decrypt a file

### Data Contracts
- `irys_upload_with_data_contract`: Upload with access control
- `irys_validate_data_contract`: Validate contract conditions
- `irys_download_with_data_contract`: Download with contract validation

### Directory Operations
- `irys_upload_directory`: Upload an entire directory

### Management
- `irys_manage_categories`: Manage file categories
- `irys_manage_tags`: Manage file tags
- `irys_monitor_performance`: Monitor system performance
- `irys_manage_plugins`: Manage plugins
- `irys_get_advanced_stats`: Get detailed statistics

### Network Operations
- `irys_check_connection`: Check network connectivity
- `irys_get_balance`: Get wallet balance
- `irys_get_file_info`: Get file information
- `irys_get_stats`: Get basic statistics
- `irys_switch_token_type`: Switch between token types
- `irys_update_share_settings`: Update file sharing settings
- `irys_revoke_share`: Revoke file sharing access

## Testing

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
npm run test:unit
npm run test:integration
npm run test:performance
```

## Project Structure

```
src/
├── index.ts                 # Main entry point
├── types/
│   └── index.ts            # TypeScript types and Zod schemas
├── services/
│   ├── IrysService.ts      # Core Irys operations
│   └── IrysAdvancedService.ts # Advanced features
└── server/
    ├── IrysMCPServer.ts    # Main MCP server
    └── IrysAdvancedMCPServer.ts # Advanced MCP server

tests/
├── unit.test.ts           # Unit tests
├── integration.test.ts    # Integration tests
├── performance.test.ts    # Performance tests
├── advanced.test.ts       # Advanced feature tests
└── comprehensive.test.ts  # Comprehensive tests

examples/
└── basic-usage.ts         # Usage examples
```

## Dependencies

### Core Dependencies
- `@irys/sdk`: Irys JavaScript SDK
- `zod`: Schema validation
- `dotenv`: Environment variable management
- `mime-types`: MIME type detection

### Advanced Dependencies
- `@irys/upload`: Advanced upload features
- `@irys/query`: Advanced querying
- `@irys/bundles`: File bundling
- `bignumber.js`: Precise number handling
- `csv-parse/csv-stringify`: CSV processing
- `async-retry`: Retry logic
- `base64url`: Base64 URL encoding

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub. 