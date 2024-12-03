import { supabase } from '../supabase/client';

export class EnquiryService {
  static async createEnquiry(userId: string, subject: string, message: string) {
    try {
      // First create the enquiry
      const { data: enquiry, error: enquiryError } = await supabase
        .from('enquiries')
        .insert([
          {
            user_id: userId,
            subject,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (enquiryError) {
        console.error('Error creating enquiry:', enquiryError);
        throw new Error(enquiryError.message);
      }

      if (!enquiry) {
        throw new Error('Failed to create enquiry');
      }

      // Then create the first message
      const { error: messageError } = await supabase
        .from('enquiry_messages')
        .insert([
          {
            enquiry_id: enquiry.id,
            content: message,
            sender_type: 'user',
            created_at: new Date().toISOString()
          }
        ]);

      if (messageError) {
        // If message creation fails, try to delete the enquiry
        await supabase.from('enquiries').delete().eq('id', enquiry.id);
        throw new Error(messageError.message);
      }

      return enquiry;
    } catch (error) {
      console.error('Error in createEnquiry:', error);
      throw error;
    }
  }

  static async getEnquiries(userId: string) {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(
          `
          *,
          enquiry_messages!fk_enquiry (
            id,
            content,
            sender_type,
            created_at
          )
        `
        )
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map((enquiry) => ({
        ...enquiry,
        lastMessage:
          enquiry.enquiry_messages[enquiry.enquiry_messages.length - 1] || null
      }));
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      throw error;
    }
  }
  
  static async getEnquiryMessages(enquiryId: string) {
    try {
      const { data, error } = await supabase
        .from('enquiry_messages')
        .select('*')
        .eq('enquiry_id', enquiryId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching enquiry messages:', error);
      throw error;
    }
  }

  static async sendMessage(
    enquiryId: string,
    content: string,
    senderType: 'user' | 'admin'
  ) {
    try {
      const timestamp = new Date().toISOString();

      const { data, error } = await supabase
        .from('enquiry_messages')
        .insert([
          {
            enquiry_id: enquiryId,
            content,
            sender_type: senderType,
            created_at: timestamp
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update enquiry timestamp
      await supabase
        .from('enquiries')
        .update({ updated_at: timestamp })
        .eq('id', enquiryId);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}
