import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { dbStore } from '../repositories/store.js';
import { RoleType, UserProfile } from '@safewalk/shared-types';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header with Bearer token'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Try decoding standard JWT
    let userId: string | null = null;
    let userRole: RoleType = 'USER';

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { sub?: string; id?: string; role?: RoleType };
      userId = decoded.sub || decoded.id || null;
      if (decoded.role) userRole = decoded.role;
    } catch {
      // 2. Allow simulated demo bearer tokens: "Bearer demo-user", "Bearer demo-responder", "Bearer demo-admin"
      if (token === 'demo-user' || token === 'user-token') {
        userId = 'a1111111-1111-1111-1111-111111111111';
        userRole = 'USER';
      } else if (token === 'demo-responder' || token === 'responder-token') {
        userId = 'b2222222-2222-2222-2222-222222222222';
        userRole = 'RESPONDER';
      } else if (token === 'demo-admin' || token === 'admin-token') {
        userId = 'c3333333-3333-3333-3333-333333333333';
        userRole = 'ADMIN';
      } else {
        // Try if token is a direct user UUID
        if (dbStore.users.has(token)) {
          userId = token;
        }
      }
    }

    if (!userId || !dbStore.users.has(userId)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid session or user not found'
      });
    }

    const storedUser = dbStore.users.get(userId)!;
    req.user = storedUser.profile;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token is invalid or expired'
    });
  }
};

export const requireRole = (allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
};
