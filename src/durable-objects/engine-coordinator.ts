/**
 * Engine Coordinator Durable Object for WitnessOS
 * 
 * Provides stateful coordination for engine calculations with
 * WebSocket support for real-time progress updates. Manages
 * calculation state, caching, and batch operations.
 */

import { DurableObject } from 'cloudflare:workers';

// Environment interface for this Durable Object
interface EngineCoordinatorEnv {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  ENGINE_SERVICE: any; // RPC binding to engine service
}

// Session tracking for WebSocket connections
interface Session {
  userId: string;
  connectionTime: number;
}

/**
 * Engine Coordinator Durable Object
 * 
 * Provides stateful coordination for engine calculations with
 * WebSocket support for real-time progress updates.
 */
export class EngineCoordinator extends DurableObject<EngineCoordinatorEnv> {
  // Track active WebSocket sessions
  private sessions: Map<WebSocket, Session> = new Map();
  
  // Track calculation progress
  private activeCalculations: Map<string, {
    status: 'pending' | 'processing' | 'complete' | 'error';
    progress: number;
    startTime: number;
    engines: string[];
    results?: any[];
    error?: string;
  }> = new Map();

  constructor(state: DurableObjectState, env: EngineCoordinatorEnv) {
    super(state, env);
    
    // Keep WebSocket connections alive by automatically responding to pings
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong")
    );
  }

  /**
   * Main fetch handler for the Durable Object
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.split('/').pop() || '';
    
    // Handle WebSocket upgrade requests
    if (request.headers.get('Upgrade') === 'websocket') {
      return await this.handleWebSocketUpgrade(request);
    }
    
    // Handle HTTP requests
    switch (path) {
      case 'calculate-batch':
        return await this.handleBatchCalculation(request);
      
      case 'calculation-status':
        return await this.handleCalculationStatus(request);
      
      case 'cancel-calculation':
        return await this.handleCancelCalculation(request);
      
      default:
        return new Response('Not found', { status: 404 });
    }
  }

  /**
   * Handle WebSocket upgrade requests
   */
  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    // Extract user ID from query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response('Missing userId parameter', { status: 400 });
    }
    
    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    // Store session information
    this.sessions.set(server, {
      userId,
      connectionTime: Date.now()
    });
    
    // Accept the WebSocket connection
    this.ctx.acceptWebSocket(server);
    
    // Send initial connection confirmation
    server.send(JSON.stringify({
      type: 'connected',
      userId,
      timestamp: new Date().toISOString()
    }));
    
    // Send active calculations for this user
    const userCalculations = Array.from(this.activeCalculations.entries())
      .filter(([calculationId, calculation]) => calculationId.startsWith(`${userId}:`))
      .map(([calculationId, calculation]) => ({
        calculationId,
        status: calculation.status,
        progress: calculation.progress,
        engines: calculation.engines,
        startTime: calculation.startTime
      }));
    
    if (userCalculations.length > 0) {
      server.send(JSON.stringify({
        type: 'active_calculations',
        calculations: userCalculations
      }));
    }
    
    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  /**
   * Handle WebSocket messages
   */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      // Only handle text messages
      if (typeof message !== 'string') return;
      
      const data = JSON.parse(message);
      const session = this.sessions.get(ws);
      
      if (!session) {
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Session not found'
        }));
        return;
      }
      
      // Handle different message types
      switch (data.type) {
        case 'subscribe_calculation':
          // Subscribe to calculation updates
          if (data.calculationId) {
            const calculation = this.activeCalculations.get(data.calculationId);
            if (calculation) {
              ws.send(JSON.stringify({
                type: 'calculation_update',
                calculationId: data.calculationId,
                status: calculation.status,
                progress: calculation.progress,
                engines: calculation.engines
              }));
            }
          }
          break;
          
        case 'ping':
          // Respond to ping (though we have auto-response configured)
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to process message'
      }));
    }
  }

  /**
   * Handle WebSocket close events
   */
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    // Clean up session
    this.sessions.delete(ws);
  }

  /**
   * Handle WebSocket errors
   */
  async webSocketError(ws: WebSocket, error: any): Promise<void> {
    console.error('WebSocket error:', error);
    this.sessions.delete(ws);
  }

  /**
   * Handle batch calculation requests
   */
  private async handleBatchCalculation(request: Request): Promise<Response> {
    try {
      const { engines, userProfile, options = {} } = await request.json();
      
      if (!engines || !Array.isArray(engines) || !userProfile) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid request parameters'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Generate a unique calculation ID
      const calculationId = `${userProfile.userId || 'anonymous'}:${Date.now()}:${crypto.randomUUID()}`;
      
      // Store calculation state
      this.activeCalculations.set(calculationId, {
        status: 'pending',
        progress: 0,
        startTime: Date.now(),
        engines: engines.map((e: any) => e.engineName || e.engine)
      });
      
      // Broadcast calculation start
      this.broadcastCalculationUpdate(userProfile.userId, calculationId, 'pending', 0);
      
      // Start calculation in the background
      this.ctx.waitUntil(this.performBatchCalculation(
        calculationId,
        engines,
        userProfile,
        options
      ));
      
      // Return calculation ID immediately
      return new Response(JSON.stringify({
        success: true,
        calculationId,
        status: 'pending'
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Batch calculation error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Perform batch calculation in the background
   */
  private async performBatchCalculation(
    calculationId: string,
    engines: any[],
    userProfile: any,
    options: any
  ): Promise<void> {
    try {
      // Update status to processing
      this.activeCalculations.set(calculationId, {
        ...this.activeCalculations.get(calculationId)!,
        status: 'processing',
        progress: 0
      });
      
      // Extract user ID from calculation ID
      const userId = calculationId.split(':')[0];
      
      // Broadcast processing started
      this.broadcastCalculationUpdate(userId, calculationId, 'processing', 0);
      
      // Process engines sequentially for better control
      const results: any[] = [];
      let completedCount = 0;
      
      for (const engine of engines) {
        try {
          // Calculate engine
          const engineName = engine.engineName || engine.engine;
          const input = engine.input || engine;
          
          // Update progress
          const progress = Math.floor((completedCount / engines.length) * 100);
          this.broadcastCalculationUpdate(userId, calculationId, 'processing', progress);
          
          // Call engine service
          const result = await this.env.ENGINE_SERVICE.calculateEngine({
            engineName,
            input,
            options: {
              ...options,
              userId: userProfile.userId
            }
          });
          
          results.push({
            engineName,
            success: result.success,
            data: result.data,
            error: result.error,
            metadata: result.metadata
          });
          
          completedCount++;
          
          // Store partial results in Durable Object storage
          await this.ctx.storage.put(`${calculationId}:results`, results);
          
          // Update progress
          const newProgress = Math.floor((completedCount / engines.length) * 100);
          this.broadcastCalculationUpdate(userId, calculationId, 'processing', newProgress);
          
        } catch (error) {
          console.error(`Engine calculation error:`, error);
          results.push({
            engineName: engine.engineName || engine.engine,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Update calculation status to complete
      this.activeCalculations.set(calculationId, {
        ...this.activeCalculations.get(calculationId)!,
        status: 'complete',
        progress: 100,
        results
      });
      
      // Broadcast completion
      this.broadcastCalculationUpdate(userId, calculationId, 'complete', 100, results);
      
      // Store final results
      await this.ctx.storage.put(`${calculationId}:results`, results);
      
      // Keep calculation in memory for 5 minutes, then clean up
      setTimeout(() => {
        this.activeCalculations.delete(calculationId);
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error('Batch calculation processing error:', error);
      
      // Extract user ID from calculation ID
      const userId = calculationId.split(':')[0];
      
      // Update calculation status to error
      this.activeCalculations.set(calculationId, {
        ...this.activeCalculations.get(calculationId)!,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Broadcast error
      this.broadcastCalculationUpdate(
        userId,
        calculationId,
        'error',
        0,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Handle calculation status requests
   */
  private async handleCalculationStatus(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const calculationId = url.searchParams.get('id');
    
    if (!calculationId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing calculation ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if calculation exists in memory
    const calculation = this.activeCalculations.get(calculationId);
    
    if (calculation) {
      return new Response(JSON.stringify({
        success: true,
        calculationId,
        status: calculation.status,
        progress: calculation.progress,
        engines: calculation.engines,
        results: calculation.status === 'complete' ? calculation.results : undefined,
        error: calculation.error,
        startTime: calculation.startTime,
        elapsedTime: Date.now() - calculation.startTime
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if calculation exists in storage
    const storedResults = await this.ctx.storage.get(`${calculationId}:results`);
    
    if (storedResults) {
      return new Response(JSON.stringify({
        success: true,
        calculationId,
        status: 'complete',
        progress: 100,
        results: storedResults
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Calculation not found'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Handle calculation cancellation requests
   */
  private async handleCancelCalculation(request: Request): Promise<Response> {
    const { calculationId } = await request.json();
    
    if (!calculationId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing calculation ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if calculation exists
    const calculation = this.activeCalculations.get(calculationId);
    
    if (!calculation) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Calculation not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Can only cancel pending or processing calculations
    if (calculation.status !== 'pending' && calculation.status !== 'processing') {
      return new Response(JSON.stringify({
        success: false,
        error: `Cannot cancel calculation with status: ${calculation.status}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extract user ID from calculation ID
    const userId = calculationId.split(':')[0];
    
    // Update calculation status
    this.activeCalculations.set(calculationId, {
      ...calculation,
      status: 'error',
      error: 'Calculation cancelled by user'
    });
    
    // Broadcast cancellation
    this.broadcastCalculationUpdate(
      userId,
      calculationId,
      'error',
      calculation.progress,
      undefined,
      'Calculation cancelled by user'
    );
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Calculation cancelled'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Broadcast calculation updates to connected WebSockets
   */
  private broadcastCalculationUpdate(
    userId: string,
    calculationId: string,
    status: 'pending' | 'processing' | 'complete' | 'error',
    progress: number,
    results?: any[],
    error?: string
  ): void {
    // Find all WebSocket sessions for this user
    for (const [ws, session] of this.sessions.entries()) {
      if (session.userId === userId && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({
            type: 'calculation_update',
            calculationId,
            status,
            progress,
            results,
            error,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('WebSocket send error:', error);
        }
      }
    }
  }
}

// Export the Durable Object class
export default EngineCoordinator;
