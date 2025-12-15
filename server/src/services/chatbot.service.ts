import {
  GoogleGenerativeAI,
  FunctionDeclaration,
  Tool,
  SchemaType,
  FunctionCall,
  GenerativeModel,
} from "@google/generative-ai";
import envConfig from "@/config/env";
import logger from "@/utils/logger";
import { ChatMessage, ToolCall, ToolResult } from "@/types/chatbot.type";
import { searchMentorsService } from "@/services/search.service";
import { getMentorProfileService } from "@/services/mentor.service";
import { getMeetingsByMenteeIdService, getMeetingsByMentorIdService } from "@/services/meeting.service";

class GeminiChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private tools: Tool[];

  constructor() {
    if (!envConfig.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    this.genAI = new GoogleGenerativeAI(envConfig.GEMINI_API_KEY);
    this.tools = this.defineTools();
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: this.tools,
    });
  }

  private defineTools(): Tool[] {
    const functionDeclarations: FunctionDeclaration[] = [
      {
        name: "search_mentors",
        description:
          "Search for mentors by keyword. Keywords can include mentor names, skills, companies, job titles, bio, or headline. Use this to help users find mentors matching their interests or needs.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            keyword: {
              type: SchemaType.STRING,
              description:
                "Search keyword(s) - can be mentor name, skills (e.g., 'JavaScript', 'React'), companies, job titles, or any text to match against mentor profiles",
            },
            page: {
              type: SchemaType.NUMBER,
              description: "Page number for pagination (default: 1)",
            },
            limit: {
              type: SchemaType.NUMBER,
              description: "Number of results per page (default: 10, max: 100)",
            },
          },
          required: ["keyword"],
        },
      },
      {
        name: "get_mentor_profile",
        description:
          "Get detailed information about a specific mentor including bio, skills, companies, plans, ratings, and feedback. Use this when the user wants to know more about a specific mentor.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            mentorId: {
              type: SchemaType.NUMBER,
              description: "The unique ID of the mentor",
            },
          },
          required: ["mentorId"],
        },
      },
      {
        name: "get_mentee_meetings",
        description:
          "Get a list of meetings for a specific mentee. This includes past, current, and upcoming meetings with mentors. Use this when a mentee wants to see their meeting history or schedule.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            menteeId: {
              type: SchemaType.NUMBER,
              description: "The unique ID of the mentee",
            },
            page: {
              type: SchemaType.NUMBER,
              description: "Page number for pagination (default: 1)",
            },
            limit: {
              type: SchemaType.NUMBER,
              description: "Number of results per page (default: 10)",
            },
          },
          required: ["menteeId"],
        },
      },
      {
        name: "get_mentor_meetings",
        description:
          "Get a list of meetings for a specific mentor. This includes all meetings where they are the mentor. Use this when a mentor wants to see their meeting schedule or history.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            mentorId: {
              type: SchemaType.NUMBER,
              description: "The unique ID of the mentor",
            },
            page: {
              type: SchemaType.NUMBER,
              description: "Page number for pagination (default: 1)",
            },
            limit: {
              type: SchemaType.NUMBER,
              description: "Number of results per page (default: 10)",
            },
          },
          required: ["mentorId"],
        },
      },
    ];

    return [
      {
        functionDeclarations,
      },
    ];
  }

  private async executeToolCall(toolCall: ToolCall, userId?: number, userRole?: string): Promise<ToolResult> {
    const { name, args } = toolCall;

    try {
      let result: unknown;

      switch (name) {
        case "search_mentors":
          result = await searchMentorsService({
            keyword: typeof args.keyword === "string" ? args.keyword : "",
            page: typeof args.page === "number" ? args.page : 1,
            limit: typeof args.limit === "number" ? args.limit : 10,
          });
          break;

        case "get_mentor_profile":
          result = await getMentorProfileService(
            typeof args.mentorId === "number" ? args.mentorId : Number(args.mentorId)
          );
          break;

        case "get_mentee_meetings": {
          // Security check: ensure user can only access their own meetings or is admin
          const menteeId = typeof args.menteeId === "number" ? args.menteeId : Number(args.menteeId);
          if (userId && userRole === "Mentee" && menteeId !== userId) {
            return {
              name,
              args,
              result: null,
              success: false,
              error: "You can only access your own meetings",
            };
          }
          result = await getMeetingsByMenteeIdService(
            menteeId,
            typeof args.page === "number" ? args.page : 1,
            typeof args.limit === "number" ? args.limit : 10
          );
          break;
        }

        case "get_mentor_meetings": {
          // Security check: ensure user can only access their own meetings or is admin
          const mentorId = typeof args.mentorId === "number" ? args.mentorId : Number(args.mentorId);
          if (userId && userRole === "Mentor" && mentorId !== userId) {
            return {
              name,
              args,
              result: null,
              success: false,
              error: "You can only access your own meetings",
            };
          }
          result = await getMeetingsByMentorIdService(
            mentorId,
            typeof args.page === "number" ? args.page : 1,
            typeof args.limit === "number" ? args.limit : 10
          );
          break;
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        name,
        args,
        result,
        success: true,
      };
    } catch (error: unknown) {
      logger.error(`Error executing tool ${name}:`, error);
      return {
        name,
        args,
        result: null,
        success: false,
        error: error instanceof Error ? error.message : "An error occurred while executing the tool",
      };
    }
  }

  async chat(
    userMessage: string,
    history: ChatMessage[] = [],
    userId?: number,
    userRole?: string
  ): Promise<{
    response: string;
    functionCalls: ToolResult[];
  }> {
    try {
      // Build chat history for context
      const chatHistory = history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      // Start a chat session with history
      const chat = this.model.startChat({
        history: chatHistory,
      });

      // System context to guide the model
      const systemContext = `You are a helpful AI assistant for a mentorship platform called Mentoria.
You help users find mentors, view their meetings, and get information about the platform.

Current user context:
${userId ? `- User ID: ${userId}` : "- User is not authenticated"}
${userRole ? `- User Role: ${userRole}` : ""}

When helping users:
- Be friendly, professional, and concise
- Use available tools to fetch real data instead of making assumptions
- If you need to search for mentors, use the search_mentors tool with relevant keywords
- If a user asks about specific mentor details, use get_mentor_profile
- If a mentee asks about their meetings, use get_mentee_meetings with their ID
- If a mentor asks about their meetings, use get_mentor_meetings with their ID
- Always provide context about what information you found
- If a tool call fails, explain the issue clearly to the user

Important: Only access data that the user is authorized to see.`;

      // Send the user message with system context
      let result = await chat.sendMessage(`${systemContext}\n\nUser: ${userMessage}`);
      let response = result.response;
      const functionCalls: ToolResult[] = [];

      // Handle function calls if any
      let functionCallParts = response.functionCalls();

      // Keep processing function calls until we get a final text response
      while (functionCallParts && functionCallParts.length > 0) {
        logger.info(`Gemini requested ${functionCallParts.length} function call(s)`);

        // Execute all function calls
        const functionResults = await Promise.all(
          functionCallParts.map(async (fc: FunctionCall) => {
            const toolCall: ToolCall = {
              name: fc.name,
              args: fc.args as Record<string, unknown>,
            };

            logger.info(`Executing tool: ${fc.name}`, fc.args);
            const toolResult = await this.executeToolCall(toolCall, userId, userRole);
            functionCalls.push(toolResult);

            return {
              functionResponse: {
                name: fc.name,
                response: toolResult.success
                  ? { success: true, data: toolResult.result }
                  : { success: false, error: toolResult.error },
              },
            };
          })
        );

        // Send function results back to the model
        result = await chat.sendMessage(functionResults);
        response = result.response;

        // Check if there are more function calls
        functionCallParts = response.functionCalls();
      }

      // Get the final text response
      const finalResponse = response.text();

      return {
        response: finalResponse,
        functionCalls,
      };
    } catch (error: unknown) {
      logger.error("Error in Gemini chat:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Chatbot error: ${errorMessage}`);
    }
  }
}

export const geminiChatbotService = new GeminiChatbotService();
