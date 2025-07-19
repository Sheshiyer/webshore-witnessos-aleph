/**
 * Forecast Session Durable Object for WitnessOS
 * 
 * Manages long-running forecast generation sessions with hibernation
 * support, progress tracking, and WebSocket communication for real-time
 * updates during forecast processing.
 */

import { DurableObject } from 'cloudflare:workers';

// Environment interface for this Durable Object
interface ForecastSessionEnv {
  DB: D1Database;
  KV_FORECASTS: KVNamespace;
  KV_CACHE: KVNamespace;
  FORECAST_SERVICE: any; // RPC binding to forecast service
  ENGINE_SERVICE: any; // RPC binding to engine service
}

// Session tracking for WebSocket connections
interface Session {
  userId: string;
  sessionType: 'daily' | 'weekly' | 'batch';
  connectionTime: number;
}

// Forecast session state
interface ForecastSessionState {
  sessionId: string;
  userId: string;
  type: 'daily' | 'weekly' | 'batch';
  status: 'pending' | 'processing' | 'complete' | 'error' | 'hibernating';
  progress: number;
  startTime: number;
  parameters: any;
  results?: any;
  error?: string;
  estimatedCompletion?: number;
}

/**
 * Forecast Session Durable Object
 * 
 * Provides stateful management for long-running forecast generation
 * sessions with WebSocket support for real-time progress updates
 * and hibernation capabilities for efficient resource usage.
 */
export class ForecastSession extends DurableObject<ForecastSessionEnv> {
  // Track active WebSocket sessions
  private sessions: Map<WebSocket, Session> = new Map();
  
  // Track active forecast sessions
  private activeSessions: Map<string, ForecastSessionState> = new Map();
  
  // Hibernation alarm for long-running sessions
  private hibernationAlarm?: number;

  constructor(state: DurableObjectState, env: ForecastSessionEnv) {
    super(state, env);
    
    // Keep WebSocket connections alive
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong")
    );
    
    // Restore active sessions from storage on startup
    this.ctx.blockConcurrencyWhile(async () => {
      await this.restoreActiveSessions();
    });
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
      case 'start-forecast':
        return await this.handleStartForecast(request);
      
      case 'forecast-status':
        return await this.handleForecastStatus(request);
      
      case 'cancel-forecast':
        return await this.handleCancelForecast(request);
      
      case 'resume-forecast':
        return await this.handleResumeForecast(request);
      
      default:
        return new Response('Not found', { status: 404 });
    }
  }

  /**
   * Handle alarm for hibernation management
   */
  async alarm(): Promise<void> {
    console.log('Forecast session alarm triggered - checking for hibernation');
    
    // Check for sessions that can be hibernated
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.status === 'processing' && this.canHibernate(session)) {
        await this.hibernateSession(sessionId);
      }
    }
    
    // Set next alarm if there are still active sessions
    if (this.activeSessions.size > 0) {
      this.hibernationAlarm = Date.now() + 300000; // 5 minutes
      await this.ctx.storage.setAlarm(this.hibernationAlarm);
    }
  }

  /**
   * Handle WebSocket upgrade requests
   */
  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const sessionType = url.searchParams.get('type') as 'daily' | 'weekly' | 'batch';
    
    if (!userId || !sessionType) {
      return new Response('Missing userId or type parameter', { status: 400 });
    }
    
    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    // Store session information
    this.sessions.set(server, {
      userId,
      sessionType,
      connectionTime: Date.now()
    });
    
    // Accept the WebSocket connection
    this.ctx.acceptWebSocket(server);
    
    // Send initial connection confirmation
    server.send(JSON.stringify({
      type: 'connected',
      userId,
      sessionType,
      timestamp: new Date().toISOString()
    }));
    
    // Send active forecast sessions for this user
    const userSessions = Array.from(this.activeSessions.entries())
      .filter(([_, session]) => session.userId === userId)
      .map(([sessionId, session]) => ({
        sessionId,
        type: session.type,
        status: session.status,
        progress: session.progress,
        startTime: session.startTime,
        estimatedCompletion: session.estimatedCompletion
      }));
    
    if (userSessions.length > 0) {
      server.send(JSON.stringify({
        type: 'active_sessions',
        sessions: userSessions
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
      
      switch (data.type) {
        case 'subscribe_session':
          if (data.sessionId) {
            const forecastSession = this.activeSessions.get(data.sessionId);
            if (forecastSession) {
              ws.send(JSON.stringify({
                type: 'session_update',
                sessionId: data.sessionId,
                status: forecastSession.status,
                progress: forecastSession.progress,
                estimatedCompletion: forecastSession.estimatedCompletion
              }));
            }
          }
          break;
          
        case 'request_resume':
          if (data.sessionId) {
            await this.resumeSession(data.sessionId);
          }
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
   * Handle start forecast requests
   */
  private async handleStartForecast(request: Request): Promise<Response> {
    try {
      const { type, userProfile, parameters = {} } = await request.json();
      
      if (!type || !userProfile) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing type or userProfile'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Generate session ID
      const sessionId = `${userProfile.userId}:${type}:${Date.now()}:${crypto.randomUUID()}`;
      
      // Create session state
      const sessionState: ForecastSessionState = {
        sessionId,
        userId: userProfile.userId,
        type,
        status: 'pending',
        progress: 0,
        startTime: Date.now(),
        parameters: { userProfile, ...parameters },
        estimatedCompletion: this.estimateCompletion(type)
      };
      
      // Store session
      this.activeSessions.set(sessionId, sessionState);
      await this.ctx.storage.put(`session:${sessionId}`, sessionState);
      
      // Broadcast session start
      this.broadcastSessionUpdate(userProfile.userId, sessionId, 'pending', 0);
      
      // Start forecast generation in background
      this.ctx.waitUntil(this.processForecast(sessionId));
      
      // Set hibernation alarm if not already set
      if (!this.hibernationAlarm) {
        this.hibernationAlarm = Date.now() + 300000; // 5 minutes
        await this.ctx.storage.setAlarm(this.hibernationAlarm);
      }
      
      return new Response(JSON.stringify({
        success: true,
        sessionId,
        status: 'pending',
        estimatedCompletion: sessionState.estimatedCompletion
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Start forecast error:', error);
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
   * Process forecast generation with hibernation support
   */
  private async processForecast(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        console.error(`Session ${sessionId} not found`);
        return;
      }
      
      // Update status to processing
      session.status = 'processing';
      session.progress = 10;
      await this.ctx.storage.put(`session:${sessionId}`, session);
      this.broadcastSessionUpdate(session.userId, sessionId, 'processing', 10);
      
      let result: any;
      
      // Generate forecast based on type
      if (session.type === 'daily') {
        result = await this.env.FORECAST_SERVICE.generateDailyForecast({
          userProfile: session.parameters.userProfile,
          date: session.parameters.date || new Date().toISOString().split('T')[0],
          options: { useCache: true, includePredictive: true }
        });
      } else if (session.type === 'weekly') {
        result = await this.env.FORECAST_SERVICE.generateWeeklyForecast({
          userProfile: session.parameters.userProfile,
          startDate: session.parameters.startDate || this.getWeekStartDate(),
          options: { useCache: true, includePredictive: true }
        });
      } else if (session.type === 'batch') {
        // Handle batch forecast generation
        result = await this.processBatchForecast(session);
      }
      
      // Update session with results
      if (result && result.success) {
        session.status = 'complete';
        session.progress = 100;
        session.results = result.data;
      } else {
        session.status = 'error';
        session.error = result?.error || 'Forecast generation failed';
      }
      
      // Store final state
      await this.ctx.storage.put(`session:${sessionId}`, session);
      
      // Broadcast completion
      this.broadcastSessionUpdate(
        session.userId,
        sessionId,
        session.status,
        session.progress,
        session.results,
        session.error
      );
      
      // Clean up session after 10 minutes
      setTimeout(() => {
        this.activeSessions.delete(sessionId);
      }, 10 * 60 * 1000);
      
    } catch (error) {
      console.error('Forecast processing error:', error);
      
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.status = 'error';
        session.error = error instanceof Error ? error.message : 'Unknown error';
        await this.ctx.storage.put(`session:${sessionId}`, session);
        
        this.broadcastSessionUpdate(
          session.userId,
          sessionId,
          'error',
          session.progress,
          undefined,
          session.error
        );
      }
    }
  }

  /**
   * Handle batch forecast processing with progress updates
   */
  private async processBatchForecast(session: ForecastSessionState): Promise<any> {
    const { dates, userProfile } = session.parameters;
    const results: any[] = [];
    let completed = 0;
    
    for (const date of dates) {
      try {
        const result = await this.env.FORECAST_SERVICE.generateDailyForecast({
          userProfile,
          date,
          options: { useCache: true }
        });
        
        results.push({
          date,
          success: result.success,
          data: result.data,
          error: result.error
        });
        
        completed++;
        const progress = Math.floor((completed / dates.length) * 90) + 10; // 10-100%
        
        // Update progress
        session.progress = progress;
        await this.ctx.storage.put(`session:${session.sessionId}`, session);
        this.broadcastSessionUpdate(session.userId, session.sessionId, 'processing', progress);
        
        // Check if we should hibernate (for very long batch jobs)
        if (completed % 10 === 0 && this.canHibernate(session)) {
          await this.hibernateSession(session.sessionId);
          // Session will resume automatically when needed
        }
        
      } catch (error) {
        results.push({
          date,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return {
      success: true,
      data: {
        batchResults: results,
        summary: {
          total: dates.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }
    };
  }

  /**
   * Handle forecast status requests
   */
  private async handleForecastStatus(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('id');
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing session ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check active sessions first
    const session = this.activeSessions.get(sessionId);
    if (session) {
      return new Response(JSON.stringify({
        success: true,
        sessionId,
        status: session.status,
        progress: session.progress,
        type: session.type,
        results: session.status === 'complete' ? session.results : undefined,
        error: session.error,
        startTime: session.startTime,
        elapsedTime: Date.now() - session.startTime,
        estimatedCompletion: session.estimatedCompletion
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check storage for hibernated/completed sessions
    const storedSession = await this.ctx.storage.get(`session:${sessionId}`);
    if (storedSession) {
      return new Response(JSON.stringify({
        success: true,
        sessionId,
        ...(storedSession as any),
        elapsedTime: Date.now() - (storedSession as any).startTime
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Session not found'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Helper methods
   */

  private async restoreActiveSessions(): Promise<void> {
    // Restore active sessions from storage
    const keys = await this.ctx.storage.list({ prefix: 'session:' });
    
    for (const [key, session] of keys.entries()) {
      const sessionData = session as ForecastSessionState;
      if (sessionData.status === 'processing' || sessionData.status === 'hibernating') {
        this.activeSessions.set(sessionData.sessionId, sessionData);
      }
    }
  }

  private canHibernate(session: ForecastSessionState): boolean {
    // Hibernate if session has been running for more than 2 minutes
    // and no WebSocket connections are active for this user
    const runningTime = Date.now() - session.startTime;
    const hasActiveConnections = Array.from(this.sessions.values())
      .some(s => s.userId === session.userId);
    
    return runningTime > 120000 && !hasActiveConnections; // 2 minutes
  }

  private async hibernateSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'hibernating';
      await this.ctx.storage.put(`session:${sessionId}`, session);
      console.log(`Hibernated session ${sessionId}`);
    }
  }

  private async resumeSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId) || 
                   await this.ctx.storage.get(`session:${sessionId}`) as ForecastSessionState;
    
    if (session && session.status === 'hibernating') {
      session.status = 'processing';
      this.activeSessions.set(sessionId, session);
      await this.ctx.storage.put(`session:${sessionId}`, session);
      
      // Resume processing
      this.ctx.waitUntil(this.processForecast(sessionId));
      
      console.log(`Resumed session ${sessionId}`);
    }
  }

  private estimateCompletion(type: string): number {
    const estimates = {
      daily: 30000,    // 30 seconds
      weekly: 180000,  // 3 minutes
      batch: 300000    // 5 minutes (depends on batch size)
    };
    
    return Date.now() + (estimates[type as keyof typeof estimates] || 60000);
  }

  private broadcastSessionUpdate(
    userId: string,
    sessionId: string,
    status: string,
    progress: number,
    results?: any,
    error?: string
  ): void {
    for (const [ws, session] of this.sessions.entries()) {
      if (session.userId === userId && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({
            type: 'session_update',
            sessionId,
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

  private getWeekStartDate(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    return startDate.toISOString().split('T')[0];
  }
}

// Export the Durable Object class
export default ForecastSession;
