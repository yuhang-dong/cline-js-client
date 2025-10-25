# Cline gRPC Client for JavaScript/TypeScript

TypeScript gRPC clients for Cline Core instances. This package provides strongly-typed gRPC clients for interacting with Cline's autonomous coding agent.

## Overview

This package contains auto-generated TypeScript gRPC clients exported from the official Cline codebase. It provides multiple client implementations and protocol buffer definitions for working with Cline Core services.

## Installation

```bash
npm install cline-grpc-client-js
```

## Usage


### Specific Client Types
```typescript
// Traditional gRPC-js clients
import { TaskServiceClient } from 'cline-grpc-client-js/grpc-js';

// Nice-grpc clients
import { TaskServiceClient } from 'cline-grpc-client-js/nice-grpc';

// Pure protocol buffer definitions
import { NewTaskRequest } from 'cline-grpc-client-js/proto';
```

## Available Services

This package provides clients for all Cline Core services including:
- TaskService
- FileService  
- WebService
- CommandService
- MCPService
- And more...

## Development

This package is automatically generated from Cline's official protocol buffer definitions. The generated code is exported directly from the Cline submodule.

## License

MIT
