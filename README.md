# Irys MCP Server

[한국어 문서](README.ko.md) | English

A Model Context Protocol (MCP) server that integrates with Irys L1 Mainnet and Testnet.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file and add the following content:

```env
# Irys L1 Private Key (64-character hex format)
IRYS_PRIVATE_KEY=your-private-key-here

# Irys L1 Network Type (mainnet or testnet)
IRYS_NETWORK=mainnet

# Irys L1 RPC URL (Optional - automatically set based on network type)
# Mainnet: https://uploader.irys.xyz
# Testnet: https://testnet-rpc.irys.xyz/v1
IRYS_GATEWAY_URL=https://uploader.irys.xyz
```

### 3. Start Server

```bash
npm start
```

## 🔧 Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
# Mainnet tests
npm test tests/real-irys.test.ts

# Testnet tests
npm test tests/real-irys-testnet.test.ts

# All tests
npm test
```

## 📚 Usage

### Basic Features

- **File Upload**: Upload files to Irys L1
- **File Download**: Download files from Irys L1
- **File Search**: Search files by tags and metadata
- **Statistics**: View statistics of uploaded files

### Advanced Features

- **Batch Upload**: Upload multiple files at once
- **Version Management**: Create and manage file versions
- **Share Settings**: Manage file sharing permissions
- **Category Management**: Create and manage file categories
- **Tag Management**: Create and manage file tags
- **Performance Monitoring**: Track upload/download performance

## 🌐 Network Information

### Mainnet
- **Network**: Irys L1 Mainnet
- **RPC URL**: https://uploader.irys.xyz
- **Token**: IRYS
- **Decimals**: 18
- **Service Class**: `IrysService`

### Testnet
- **Network**: Irys L1 Testnet
- **RPC URL**: https://testnet-rpc.irys.xyz/v1
- **Chain ID**: 1270
- **Token**: IRYS (mIRYS)
- **Decimals**: 18
- **Service Class**: `IrysTestnetService`

## 🔄 Network Switching

You can switch between mainnet and testnet by changing the `IRYS_NETWORK` environment variable:

```bash
# Use mainnet
export IRYS_NETWORK=mainnet

# Use testnet
export IRYS_NETWORK=testnet
```

## 🏗️ Architecture

### Service Classes

#### IrysService (Mainnet)
- Mainnet-specific service class
- All features integrate with actual Irys L1 mainnet
- `src/services/IrysService.ts`

#### IrysTestnetService (Testnet)
- Testnet-specific service class
- Provides the same features as mainnet on testnet
- Uses mainnet URL for SDK initialization to resolve compatibility issues
- `src/services/IrysTestnetService.ts`

### Test Files

#### Mainnet Tests
- `tests/real-irys.test.ts`
- Tests all mainnet features with actual implementation

#### Testnet Tests
- `tests/real-irys-testnet.test.ts`
- Tests all testnet features with actual implementation

## 📝 License

MIT License 