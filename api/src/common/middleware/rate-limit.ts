import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Implementação simples de rate limiting em memória
// Para produção, usar Redis ou similar
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, { count: number; resetTime: number }>();
  
  // Configurações
  private readonly maxRequests = 100; // máximo de requests
  private readonly windowMs = 15 * 60 * 1000; // 15 minutos

  use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Limpar dados expirados
    this.cleanExpiredEntries(now);
    
    // Verificar rate limit
    const clientData = this.requests.get(clientIp);
    
    if (!clientData) {
      // Primeira requisição do cliente
      this.requests.set(clientIp, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      next();
      return;
    }
    
    if (now > clientData.resetTime) {
      // Window expirou, resetar contador
      this.requests.set(clientIp, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      next();
      return;
    }
    
    if (clientData.count >= this.maxRequests) {
      // Limite excedido
      res.status(429).json({
        success: false,
        message: 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      });
      return;
    }
    
    // Incrementar contador
    clientData.count++;
    this.requests.set(clientIp, clientData);
    
    // Headers informativos
    res.set({
      'X-RateLimit-Limit': this.maxRequests.toString(),
      'X-RateLimit-Remaining': (this.maxRequests - clientData.count).toString(),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString(),
    });
    
    next();
  }
  
  private cleanExpiredEntries(now: number) {
    for (const [ip, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

// Middleware específico para login (mais restritivo)
@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  private loginAttempts = new Map<string, { count: number; resetTime: number }>();
  
  private readonly maxAttempts = 5; // máximo de tentativas de login
  private readonly windowMs = 15 * 60 * 1000; // 15 minutos

  use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    this.cleanExpiredEntries(now);
    
    const attempts = this.loginAttempts.get(clientIp);
    
    if (!attempts) {
      this.loginAttempts.set(clientIp, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      next();
      return;
    }
    
    if (now > attempts.resetTime) {
      this.loginAttempts.set(clientIp, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      next();
      return;
    }
    
    if (attempts.count >= this.maxAttempts) {
      res.status(429).json({
        success: false,
        message: 'Muitas tentativas de login. Conta temporariamente bloqueada.',
        retryAfter: Math.ceil((attempts.resetTime - now) / 1000),
      });
      return;
    }
    
    attempts.count++;
    this.loginAttempts.set(clientIp, attempts);
    next();
  }
  
  private cleanExpiredEntries(now: number) {
    for (const [ip, data] of this.loginAttempts.entries()) {
      if (now > data.resetTime) {
        this.loginAttempts.delete(ip);
      }
    }
  }
}