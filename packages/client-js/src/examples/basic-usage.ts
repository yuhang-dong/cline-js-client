import { cline } from 'cline-grpc-client-js/grpc-js';
import { credentials } from '@grpc/grpc-js';

async function basicExample() {
  const address = '127.0.0.1:50694';
  const creds = credentials.createInsecure();


  const modelClient = new cline.ModelsServiceClient(address, creds);
  await new Promise((resolve, reject) => {
    modelClient.updateApiConfigurationPartial(cline.UpdateApiConfigurationPartialRequest.fromPartial({
      apiConfiguration: {
        deepSeekApiKey: ``,
      },
      updateMask: ['deepSeekApiKey'],
    }), (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });

  // Create clients for all services
  const taskClient = new cline.TaskServiceClient(address, creds);
  const uiClient = new cline.UiServiceClient(address, creds);
  const stateClient = new cline.StateServiceClient(address, creds);

  console.log('Creating new task...');

  // 1. Create the task first
  const taskResponse = await new Promise<cline.String>((resolve, reject) => {
    taskClient.newTask(
      cline.NewTaskRequest.fromPartial({
        text: 'Hello! Can you help me understand how to use the Cline API?',
        taskSettings: {
          planModeApiProvider: cline.ApiProvider.DEEPSEEK,
          mode: cline.PlanActMode.PLAN,
        }
      }),
      (err: any, response: cline.String) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });

  console.log('Task created successfully with ID:', taskResponse.value);

  // 2. Subscribe to state updates (for conversation state)
  console.log('Subscribing to state updates...');
  const stateStream = stateClient.subscribeToState(cline.EmptyRequest.create());

  stateStream.on('data', (stateUpdate: cline.State) => {
    console.log('State update received');
    if (stateUpdate.stateJson) {
      
      try {
        const stateData = JSON.parse(stateUpdate.stateJson);
        console.log('Current task state:', stateData.currentTaskItem?.id);
        
        // Extract and process messages from state
        if (stateData.clineMessages) {
          for (const msg of stateData.clineMessages) {
            // Handle API request errors
            if (msg.say === 'api_req_started' && msg.text) {
              try {
                const apiInfo = JSON.parse(msg.text);
                
                // Check for API errors
                if (apiInfo.cancelReason === 'streaming_failed' && apiInfo.streamingFailedMessage) {
                  console.log('❌ API Error:', apiInfo.streamingFailedMessage);
                  try {
                    const errorDetails = JSON.parse(apiInfo.streamingFailedMessage);
                    console.log('Error Details:', errorDetails.message);
                    console.log('Provider:', errorDetails.providerId);
                    console.log('Model:', errorDetails.modelId);
                  } catch (parseError) {
                    console.log('Error Details:', apiInfo.streamingFailedMessage);
                  }
                }
              } catch (parseError) {
                console.log('Failed to parse API info:', msg.text);
              }
            }
            
            // Handle other error types
            if (msg.ask === 'api_req_failed') {
              console.log('\n--- API Request Failed ---');
              console.log('Error:', msg.text);
            }
          }
        }
      } catch (e) {
        console.log('Failed to parse state JSON');
      }
    }
  });

  stateStream.on('error', (err) => {
    console.error('State stream error:', err);
  });

  stateStream.on('end', () => {
    console.log('State stream ended');
  });

  // 3. Subscribe to partial messages (for streaming AI responses)
  console.log('Subscribing to partial messages...');
  const partialStream = uiClient.subscribeToPartialMessage(cline.EmptyRequest.create());
  // partialStream.eventNames().forEach(name => console.log('Partial stream event:', name));
  partialStream.on('data', (message: cline.ClineMessage) => {
    console.log('\n--- Received Message ---');
    console.log('Type:', cline.ClineMessageType[message.type]);
    console.log('Ask:', cline.ClineAsk[message.ask]);
    console.log('Say:', cline.ClineSay[message.say]);
    console.log('Partial:', message.partial);
    
    // Extract the actual AI response
    if (message.text && message.text.trim()) {
      console.log('AI Response:', message.text);
    }
    
    if (message.reasoning && message.reasoning.trim()) {
      console.log('Reasoning:', message.reasoning);
    }

    // Check for completion
    if (message.say === cline.ClineSay.COMPLETION_RESULT_SAY) {
      console.log('🎉 Task completed!');
    }
  });

  partialStream.on('error', (err) => {
    console.error('Partial message stream error:', err);
  });

  partialStream.on('end', () => {
    console.log('Partial message stream ended');
  });

  // Keep the streams alive for a while to receive responses
  console.log('Waiting for AI responses... (Press Ctrl+C to exit)');
  
  // Set a timeout to gracefully close after some time
  setTimeout(() => {
    console.log('Closing streams...');
    stateStream.cancel();
    partialStream.cancel();
    process.exit(0);
  }, 50000); // Wait 30 seconds for responses
}

// Run the example
basicExample().catch(console.error);
