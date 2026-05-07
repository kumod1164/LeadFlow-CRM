import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { Types } from 'mongoose';

/**
 * Create an assignment notification when a lead is assigned to a user
 * @param userId - The ID of the user being assigned the lead
 * @param leadId - The ID of the lead being assigned
 * @param leadName - The name of the lead
 * @param assignerName - The name of the user who assigned the lead
 */
export async function createAssignmentNotification(
  userId: string | Types.ObjectId,
  leadId: string | Types.ObjectId,
  leadName: string,
  assignerName: string
): Promise<void> {
  try {
    await connectDB();

    const message = `${assignerName} assigned lead "${leadName}" to you`;

    await Notification.create({
      userId: new Types.ObjectId(userId),
      type: 'assignment',
      message,
      leadId: new Types.ObjectId(leadId),
      read: false,
    });
  } catch (error) {
    console.error('Error creating assignment notification:', error);
    // Don't throw - notification failure shouldn't break the main operation
  }
}

/**
 * Create a follow-up notification for a lead's follow-up date
 * @param userId - The ID of the user assigned to the lead
 * @param leadId - The ID of the lead
 * @param leadName - The name of the lead
 * @param followUpDate - The follow-up date
 */
export async function createFollowUpNotification(
  userId: string | Types.ObjectId,
  leadId: string | Types.ObjectId,
  leadName: string,
  followUpDate: Date
): Promise<void> {
  try {
    await connectDB();

    const dateStr = followUpDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const message = `Follow-up reminder for lead "${leadName}" on ${dateStr}`;

    await Notification.create({
      userId: new Types.ObjectId(userId),
      type: 'follow_up',
      message,
      leadId: new Types.ObjectId(leadId),
      read: false,
    });
  } catch (error) {
    console.error('Error creating follow-up notification:', error);
    // Don't throw - notification failure shouldn't break the main operation
  }
}
