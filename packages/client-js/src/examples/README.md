# Cline JavaScript Client Examples

This directory contains examples for using the Cline gRPC client in JavaScript/TypeScript.

## Basic Usage Example

The `basic-usage.ts` file demonstrates the correct pattern for creating tasks and receiving AI responses from Cline.

### Key Features

1. **Task Creation**: Creates a new task with proper settings
2. **State Streaming**: Subscribes to state updates for conversation state
3. **Partial Message Streaming**: Subscribes to streaming AI responses
4. **API Error Handling**: Properly captures and displays API errors

### Usage Pattern

The example follows the same pattern as the Cline CLI:

1. **Create the task first** using `TaskService.newTask()`
2. **Subscribe to state updates** using `StateService.subscribeToState()`
3. **Subscribe to partial messages** using `UiService.subscribeToPartialMessage()`

### API Error Handling

The implementation properly handles API errors like missing API keys:

- **State Stream**: Captures `api_req_started` messages with error details
- **Error Details**: Extracts `streamingFailedMessage` from `apiReqInfo`
- **JSON Parsing**: Properly parses nested JSON error structures

### Common Error Scenarios

1. **Missing API Keys**: "DeepSeek API key is required"
2. **Authentication Issues**: Invalid API keys or tokens
3. **Rate Limiting**: API quota exceeded
4. **Network Issues**: Connection failures

### Running the Example

```bash
cd cline-js-client/packages/client-js
npm run build
node dist/examples/basic-usage.js
```

### Expected Output

When successful:
- Task creation confirmation
- AI responses streaming in real-time
- Task completion notification

When API errors occur:
- Clear error messages with details
- Provider and model information
- Specific error reasons

### Troubleshooting

1. **No responses received**: Ensure Cline instance is running at the specified address
2. **API errors**: Check API key configuration in Cline settings
3. **Connection issues**: Verify the gRPC server address and port
4. **Stream timeouts**: Adjust the timeout duration in the example

### Architecture Notes

- **State Stream**: Contains conversation state, task progress, and API error details
- **Partial Message Stream**: Contains streaming AI responses and reasoning
- **Error Handling**: API errors come through state stream, not partial message stream
- **Message Types**: Different message types (ASK/SAY) indicate different interaction patterns
