import KomentarRepository from "../repository/komentar.repository";
import { KomentarDTO } from "../dto/komentar.dto";
import { Komentar, PrismaClient } from "@prisma/client";

import AppError from "../utils/appError";
import { sanitizeInput } from "../utils/security.utils";

// Separate the AuthorizationService to its own file
export class AuthorizationService {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  /**
   * Check if user can add comment to a request
   */
  public async canAddComment(userId: string, requestId?: string): Promise<boolean> {
    // If no requestId, this is likely a general comment
    if (!requestId) {
      return true; // Implement according to your business rules
    }
    
    // Check if user owns the request or has access to it
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      select: { userId: true }
    });
    
    if (!request) return false;
    
    // Check if user is the owner or has admin role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return request.userId === userId || user?.role === 'ADMIN';
  }
  
  /**
   * Check if user can view comments for a request
   */
  public async canViewComments(userId: string, requestId: string): Promise<boolean> {
    return this.canAddComment(userId, requestId);
  }
}

// Export the KomentarService class
export class KomentarService {
  private readonly komentarRepository: KomentarRepository;
  private readonly authService: AuthorizationService;

  constructor() {
    this.komentarRepository = new KomentarRepository();
    this.authService = new AuthorizationService();
  }

  /**
   * Add a new comment with security controls
   * @param komentarData Data for the new comment
   * @param requestingUserId ID of the user making the request
   */
  public async addKomentar(komentarData: KomentarDTO, requestingUserId: string): Promise<Komentar> {
    // Authorization check
    if (komentarData.requestId && !await this.authService.canAddComment(requestingUserId, komentarData.requestId)) {
      throw new AppError("Unauthorized to add comment to this request", 403);
    }
    
    // Input validation and sanitization
    if (!komentarData.text || komentarData.text.trim() === "") {
      throw new AppError("Comment text cannot be empty", 400);
    }
    
    // Sanitize the input to prevent XSS
    const sanitizedData = {
      ...komentarData,
      text: sanitizeInput(komentarData.text)
    };
    
    // Set the correct userId from the authenticated user
    sanitizedData.userId = requestingUserId;
    
    // Add audit information
    const commentWithAudit = {
      ...sanitizedData,
      createdBy: requestingUserId,
      createdAt: new Date()
    };
    
    // Store the comment
    return this.komentarRepository.addKomentar(commentWithAudit);
  }
  
  /**
   * Get comments with appropriate access controls
   */
  
}

// Default export the KomentarService
export default KomentarService;