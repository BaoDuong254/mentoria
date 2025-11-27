import poolPromise from "@/config/database";
import { Message, MessageResponse, ConversationResponse } from "@/types/message.type";
import sql from "mssql";

export const getUsersForSidebarService = async (currentUserId: number) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool.request().input("currentUserId", sql.Int, currentUserId).query(`
        SELECT 
          user_id,
          first_name,
          last_name,
          CONCAT(first_name, ' ', last_name) AS full_name,
          avatar_url,
          email
        FROM users
        WHERE user_id != @currentUserId
        ORDER BY first_name, last_name
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error in getUsersForSidebarService:", error);
    throw error;
  }
};

export const getMessagesByUserIdService = async (
  currentUserId: number,
  otherUserId: number
): Promise<MessageResponse[]> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool
      .request()
      .input("currentUserId", sql.Int, currentUserId)
      .input("otherUserId", sql.Int, otherUserId).query(`
        SELECT 
          message_id,
          sender_id,
          receiver_id,
          content,
          sent_time
        FROM messages
        WHERE 
          (sender_id = @currentUserId AND receiver_id = @otherUserId)
          OR 
          (sender_id = @otherUserId AND receiver_id = @currentUserId)
        ORDER BY sent_time ASC
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error in getMessagesByUserIdService:", error);
    throw error;
  }
};

export const sendMessageService = async (senderId: number, receiverId: number, content: string): Promise<Message> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool
      .request()
      .input("senderId", sql.Int, senderId)
      .input("receiverId", sql.Int, receiverId)
      .input("content", sql.NVarChar, content)
      .input("sentTime", sql.DateTime, new Date()).query(`
        INSERT INTO messages (sender_id, receiver_id, content, sent_time)
        OUTPUT INSERTED.*
        VALUES (@senderId, @receiverId, @content, @sentTime)
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Error in sendMessageService:", error);
    throw error;
  }
};

export const getConversationsService = async (userId: number): Promise<ConversationResponse[]> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool.request().input("userId", sql.Int, userId).query(`
        WITH LatestMessages AS (
          SELECT 
            CASE 
              WHEN sender_id = @userId THEN receiver_id
              ELSE sender_id
            END AS other_user_id,
            content AS latest_message,
            sent_time AS latest_time,
            ROW_NUMBER() OVER (
              PARTITION BY 
                CASE 
                  WHEN sender_id = @userId THEN receiver_id
                  ELSE sender_id
                END
              ORDER BY sent_time DESC
            ) AS rn
          FROM messages
          WHERE sender_id = @userId OR receiver_id = @userId
        )
        SELECT 
          ROW_NUMBER() OVER (ORDER BY lm.latest_time DESC) AS conversation_id,
          lm.other_user_id,
          CONCAT(u.first_name, ' ', u.last_name) AS other_user_name,
          u.avatar_url AS other_user_avatar,
          lm.latest_message,
          lm.latest_time
        FROM LatestMessages lm
        INNER JOIN users u ON lm.other_user_id = u.user_id
        WHERE lm.rn = 1
        ORDER BY lm.latest_time DESC
      `);

    return result.recordset || [];
  } catch (error) {
    console.error("Error in getConversationsService:", error);
    throw error;
  }
};
