# Cline JS Client Ecosystem

A comprehensive JavaScript/TypeScript ecosystem for interacting with Cline AI coding assistant.

## Packages

This monorepo contains two packages:

### 1. `cline-grpc-client-js`
Raw gRPC clients for direct communication with Cline Core instances. Use this if you need low-level access to Cline's gRPC API.

### 2. `cline-client-js`
High-level wrapper with instance management, task automation, and streaming support. Use this for most applications.

## Quick Start

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/your-org/cline-js-client
cd cline-js-client

# Install dependencies
pnpm install

# Build proto files
pnpm proto:build

# Build packages
pnpm build
```

## Usage

### High-level Wrapper (Recommended)
```typescript
import { ClineClient } from 'cline-client-js';

const cline = new ClineClient();
await cline.startInstance();

const task = await cline.createTask('Help me debug this code');
await task.sendMessage('Can you explain that further?');
```

### Raw gRPC Client
```typescript
import { ClineGrpcClient } from 'cline-grpc-client-js';

const client = new ClineGrpcClient('localhost:50694');
await client.task.askResponse({
  responseType: 'messageResponse',
  text: 'Follow up question'
});
```

## Development

```bash
# Install all dependencies
pnpm install:all

# Build proto files
pnpm proto:build

# Build all packages
pnpm build

# Run tests
pnpm test

# Run in development mode
pnpm dev
```

## Architecture

- **Cline Submodule**: Contains the official Cline source code for proto compilation
- **Proto Compilation**: Uses Cline's build system to generate TypeScript gRPC clients
- **Monorepo**: pnpm workspaces for coordinated development
- **TypeScript**: Full TypeScript support with type definitions

## License

Apache-2.0
