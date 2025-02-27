export interface INotification {
    id: string;
    sender: string; // User ID
    recipient: string; // User ID
    message: string;
    createdAt: Date;
  }  