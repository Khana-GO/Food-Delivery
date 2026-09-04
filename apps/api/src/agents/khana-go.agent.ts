/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable no-control-regex */
import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { RestaurantTools } from '../tools/restaurant.tools';
import { MenuTools } from '../tools/menu.tools';
import { OrderTools, orderContext } from '../tools/order.tools';
import { DeliveryTools, deliveryContext } from '../tools/delivery.tools';

const MAX_SESSIONS = 500;
const MAX_HISTORY_PER_SESSION = 20;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_RESPONSE_LENGTH = 1200;

function isValidUUID(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}
function sanitizeForPrompt(input: string): string {
  if (!input) return '';
  return input
    .slice(0, MAX_MESSAGE_LENGTH)
    .replace(/[\u0000-\u001F\u007F]/g, ' ') // strip control chars
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .trim();
}
function sanitizeOutput(text: string): string {
  if (!text) return '';
  let out = text.slice(0, MAX_RESPONSE_LENGTH);
  out = out.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  // Prevent leaking stack traces / tool internals
  out = out.replace(/at\s+.*\(.*:\d+:\d+\)/g, '');
  return out.trim();
}
function sanitizeContextId(id?: string): string | null {
  if (!id) return null;
  const v = id.trim();
  return isValidUUID(v) ? v : null;
}

@Injectable()
export class KhanaGoAgent {
  private readonly logger = new Logger(KhanaGoAgent.name);
  private agent: any | null = null;
  private agentType: 'langgraph' | 'legacy' | null = null;
  private sessionHistories: Map<string, any[]> = new Map();
  private initializationWarned = false;

  constructor(
    private readonly restaurantTools: RestaurantTools,
    private readonly menuTools: MenuTools,
    private readonly orderTools: OrderTools,
    private readonly deliveryTools: DeliveryTools,
  ) {}

  private evictIfNeeded(key: string) {
    if (
      this.sessionHistories.size >= MAX_SESSIONS &&
      !this.sessionHistories.has(key)
    ) {
      const oldest = this.sessionHistories.keys().next().value;
      if (oldest) {
        this.sessionHistories.delete(oldest);
        this.logger.debug(
          `Evicted oldest session ${oldest} (cap ${MAX_SESSIONS})`,
        );
      }
    }
  }

  // ─── Initialize Agent (supports free OpenRouter/Groq via OPENAI_BASE_URL) ───
  async initializeAgent() {
    if (this.agent) return;
    if (!process.env.OPENAI_API_KEY) {
      if (!this.initializationWarned) {
        this.logger.log(
          'OPENAI_API_KEY not set – agent running in rule-based fallback mode (no LLM)',
        );
        this.initializationWarned = true;
      }
      return;
    }

    let modelName = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    let baseURL = process.env.OPENAI_BASE_URL;
    const apiKey = process.env.OPENAI_API_KEY || '';
    if (!baseURL && apiKey.startsWith('sk-or-v1-')) {
      baseURL = 'https://openrouter.ai/api/v1';
      if (
        [
          'gpt-3.5-turbo',
          'gemini-2.5-flash',
          'openrouter/free',
          'openrouter',
          'google/gemma-2-9b-it:free',
        ].includes(modelName)
      )
        modelName = 'openai/gpt-oss-20b:free';
      this.logger.log(
        `Detected OpenRouter key – using ${baseURL} model ${modelName}`,
      );
    } else if (!baseURL && apiKey.startsWith('gsk_')) {
      baseURL = 'https://api.groq.com/openai/v1';
      if (
        [
          'gemini-2.5-flash',
          'openrouter/free',
          'google/gemma-2-9b-it:free',
        ].includes(modelName)
      )
        modelName = 'llama-3.1-8b-instant';
      this.logger.log(
        `Detected Groq key – using ${baseURL} model ${modelName}`,
      );
    } else if (modelName === 'gemini-2.5-flash' && !baseURL) {
      this.logger.warn(
        `Model gemini-2.5-flash requires OPENAI_BASE_URL – falling back. Set OPENAI_MODEL to gpt-3.5-turbo or use OpenRouter free.`,
      );
    } else if (modelName === 'openrouter/free') {
      modelName = 'openai/gpt-oss-20b:free';
      if (!baseURL) baseURL = 'https://openrouter.ai/api/v1';
    }
    if (modelName.startsWith('google/') || modelName.includes('gemma')) {
      this.logger.warn(
        `Model ${modelName} not supported – falling back to gpt-3.5-turbo`,
      );
      modelName = 'gpt-3.5-turbo';
    }
    const temperature = parseFloat(process.env.AI_TEMPERATURE || '0.7');
    const maxTokens = parseInt(process.env.AI_MAX_TOKENS || '500');

    let model: any;
    try {
      const config: any = baseURL ? { baseURL } : undefined;
      if (baseURL?.includes('openrouter.ai')) {
        config.defaultHeaders = {
          'HTTP-Referer':
            process.env.FRONTEND_URL_WEB || 'http://localhost:3000',
          'X-Title': 'KhanaGo',
        };
      }
      model = new ChatOpenAI({
        model: modelName,
        temperature,
        maxTokens,
        apiKey,
        configuration: config,
      } as any);
    } catch (e: any) {
      this.logger.warn(
        `Failed to create ChatOpenAI (${e.message}) – using fallback`,
      );
      return;
    }

    const tools = [
      this.restaurantTools.getSearchRestaurantsTool(),
      this.restaurantTools.getRestaurantDetailsTool(),
      this.restaurantTools.getPopularRestaurantsTool(),
      this.restaurantTools.getRestaurantAvailabilityTool(),
      this.menuTools.getMenuItemsTool(),
      this.menuTools.getMenuItemDetailsTool(),
      this.menuTools.getSearchMenuItemsTool(),
      this.orderTools.getOrderStatusTool(),
      this.orderTools.getOrderDetailsTool(),
      this.orderTools.getOrderHistoryTool(),
      this.deliveryTools.getDeliveryStatusTool(),
      this.deliveryTools.getDeliveryTimeTool(),
    ];

    try {
      const { createReactAgent } =
        await import('@langchain/langgraph/prebuilt');
      if (createReactAgent) {
        this.agent = createReactAgent({
          llm: model,
          tools: tools as any,
        } as any);
        this.agentType = 'langgraph';
        this.logger.log(
          `KhanaGo Agent initialized (langgraph) with ${modelName}${baseURL ? ` via ${baseURL}` : ''}`,
        );
        return;
      }
    } catch (e: any) {
      this.logger.debug(`langgraph prebuilt not available: ${e.message}`);
    }

    // Legacy langchain/agents removed in 1.5 – no fallback needed, rule-based is sufficient
    if (!this.initializationWarned) {
      this.logger.log(
        `LangChain agent not available – running rule-based fallback`,
      );
      this.initializationWarned = true;
    }
  }

  // ─── Process Message – request-scoped via AsyncLocalStorage to avoid race ───
  async processMessage(
    userId: string,
    message: string,
    context?: {
      restaurantId?: string;
      orderId?: string;
      location?: { lat: number; lng: number };
    },
    sessionId?: string,
  ): Promise<{ response: string; quickReplies?: string[]; intent?: string }> {
    const sanitizedMessage = sanitizeForPrompt(message);
    if (!sanitizedMessage) {
      return {
        response: 'Please send a valid message (1-1000 chars). 😊',
        quickReplies: ['Help', 'Show popular restaurants'],
      };
    }
    const safeContext = {
      restaurantId: sanitizeContextId(context?.restaurantId) || undefined,
      orderId: sanitizeContextId(context?.orderId) || undefined,
      location:
        context?.location &&
        typeof context.location.lat === 'number' &&
        typeof context.location.lng === 'number'
          ? { lat: context.location.lat, lng: context.location.lng }
          : undefined,
    };

    // Run entire flow inside CLS contexts so tools can read currentUserId without mutable singleton race
    return orderContext.run({ userId }, () =>
      deliveryContext.run({ userId }, async () => {
        await this.initializeAgent();
        const historyKey = sessionId || userId;
        this.evictIfNeeded(historyKey);
        let contextString = '';
        if (safeContext.restaurantId)
          contextString += `Viewing restaurant: ${safeContext.restaurantId}. `;
        if (safeContext.orderId)
          contextString += `Order ID: ${safeContext.orderId}. `;
        if (safeContext.location)
          contextString += `Location: ${safeContext.location.lat},${safeContext.location.lng}. `;
        // Escape context for prompt to prevent injection
        const safeContextString = sanitizeForPrompt(contextString);

        const history = this.sessionHistories.get(historyKey) || [];
        if (!this.agent)
          return this.fallbackProcess(
            sanitizedMessage,
            safeContext,
            historyKey,
            history,
          );

        try {
          let output: string;
          if (this.agentType === 'langgraph') {
            const systemContent = `You are KhanaGo, friendly Nepali food delivery assistant. Use tools for real data, never hallucinate. Keep concise. Delimiters: <instructions> vs <user_data>. <context>${safeContextString || 'No context'}</context>`;
            const messages = [
              new SystemMessage(systemContent),
              ...history.slice(-10),
              new HumanMessage(`<user_data>${sanitizedMessage}</user_data>`),
            ];
            const result = await this.agent.invoke({ messages });
            const last = result.messages?.[result.messages.length - 1];
            output =
              (last?.content as string) ||
              (typeof last?.content === 'object'
                ? JSON.stringify(last.content)
                : '') ||
              "I'm here to help! Could you rephrase?";
            if (Array.isArray(last?.content)) {
              const textBlock = last.content.find(
                (c: any) => c.type === 'text',
              );
              if (textBlock) output = textBlock.text;
            }
          } else {
            const result = await this.agent.invoke({
              input: sanitizedMessage,
              context:
                safeContextString || 'No specific context. User exploring app.',
              chat_history: history.slice(-10),
            });
            output = result.output || "I'm here to help! Could you rephrase?";
          }
          output = sanitizeOutput(output);
          const newHistory = [
            ...history,
            new HumanMessage(sanitizedMessage),
            new AIMessage(output),
          ];
          this.sessionHistories.set(
            historyKey,
            newHistory.slice(-MAX_HISTORY_PER_SESSION),
          );
          return {
            response: output,
            quickReplies: this.generateQuickReplies(output, safeContext),
            intent: this.detectIntent(sanitizedMessage),
          };
        } catch (error: any) {
          // Don't leak internal error details to client
          this.logger.debug(
            `Agent error (${error.message}) – falling back to rule-based`,
          );
          const fallback = await this.fallbackProcess(
            sanitizedMessage,
            safeContext,
            historyKey,
            history,
          );
          if (fallback.response) return fallback;
          return {
            response: 'Sorry, I had an error. Please rephrase! 🍽️',
            quickReplies: ['Help', 'Show restaurants', 'Track order'],
          };
        }
      }),
    );
  }

  private async invokeTool(tool: any, input: string): Promise<any> {
    const sanitized = sanitizeForPrompt(input).slice(0, 80);
    const raw: any = await tool.func(sanitized);
    const str =
      typeof raw === 'string'
        ? raw
        : (raw?.toString?.() ?? JSON.stringify(raw));
    try {
      return JSON.parse(str);
    } catch {
      return { error: str.slice(0, 500) };
    }
  }

  private async fallbackProcess(
    message: string,
    context: { restaurantId?: string; orderId?: string } | undefined,
    historyKey: string,
    history: any[],
  ): Promise<{ response: string; quickReplies?: string[]; intent?: string }> {
    const intent = this.detectIntent(message);
    const lower = message.toLowerCase();
    try {
      if (
        intent === 'popular_restaurants' ||
        lower.includes('popular') ||
        lower.includes('best')
      ) {
        const data = await this.invokeTool(
          this.restaurantTools.getPopularRestaurantsTool(),
          '',
        );
        const list = data.restaurants?.slice(0, 5) || [];
        if (!list.length)
          return {
            response: "I couldn't find popular restaurants right now.",
            quickReplies: ['Find food', 'Help'],
            intent,
          };
        const formatted = list
          .map(
            (r: any) =>
              `• ${sanitizeOutput(r.name)} (${sanitizeOutput(r.cuisineType)}) - ⭐ ${r.rating || 'New'} ${r.isOpen ? '🟢 Open' : '🔴 Closed'}`,
          )
          .join('\n');
        const response = sanitizeOutput(
          `Here are popular restaurants 🍽️\n\n${formatted}\n\nWant menu for one?`,
        );
        this.saveHistory(historyKey, history, message, response);
        return {
          response,
          quickReplies: ['Show menu', 'Find near me', 'Help'],
          intent,
        };
      }
       if (
         intent === 'search_restaurants' ||
         (lower.includes('restaurant') || lower.includes('food')) &&
           intent !== 'restaurant_availability'
       ) {
        const query =
          message
            .replace(/search|find|show|restaurant|food|eat|near|me/gi, '')
            .trim() || message.trim();
        const data = await this.invokeTool(
          this.restaurantTools.getSearchRestaurantsTool(),
          query.slice(0, 50),
        );
        if (data.error) throw new Error(data.error);
        const list = data.restaurants || [];
        if (!list.length) {
          const response = sanitizeOutput(
            `No restaurants for "${sanitizeForPrompt(query)}". Try Nepali, Indian, Chinese? 🍜`,
          );
          this.saveHistory(historyKey, history, message, response);
          return {
            response,
            quickReplies: ['Show popular restaurants', 'Help'],
            intent,
          };
        }
        const formatted = list
          .slice(0, 5)
          .map(
            (r: any) =>
              `• ${sanitizeOutput(r.name)} - ${sanitizeOutput(r.cuisineType)} ${r.isOpen ? '🟢' : '🔴'} (Rs. ${r.deliveryFee || 0})`,
          )
          .join('\n');
        const response = sanitizeOutput(
          `Found ${data.count} restaurants for "${sanitizeForPrompt(query)}" 🍕\n\n${formatted}`,
        );
        this.saveHistory(historyKey, history, message, response);
        return {
          response,
          quickReplies: ["What's on the menu?", 'Is it open?', 'Help'],
          intent,
        };
      }
      const isMenuIntent =
        intent === 'menu_query' ||
        lower.includes('menu') ||
        lower.includes('dish') ||
        [
          'momo',
          'pizza',
          'burger',
          'biryani',
          'chowmein',
          'thukpa',
          'fried rice',
          'noodles',
          'chicken',
          'paneer',
          'sekwa',
          'thali',
        ].some((k) => lower.includes(k));
      if (isMenuIntent) {
        const isShowMenuOnly = ['show menu', 'menu', 'show me menu'].includes(
          lower.trim(),
        );
        if (isShowMenuOnly && !context?.restaurantId) {
          const response =
            "Which restaurant's menu? Tap 'Show popular restaurants' or tell me name. 🍽️";
          this.saveHistory(historyKey, history, message, response);
          return {
            response,
            quickReplies: ['Show popular restaurants', 'Find momo', 'Help'],
            intent,
          };
        }
        if (context?.restaurantId) {
          const data = await this.invokeTool(
            this.menuTools.getMenuItemsTool(),
            context.restaurantId,
          );
          if (data.error) throw new Error(data.error);
          const cats = data.categories || [];
          if (!cats.length) {
            const response =
              "This restaurant hasn't added menu yet. Try others?";
            this.saveHistory(historyKey, history, message, response);
            return {
              response,
              quickReplies: ['Show popular restaurants', 'Help'],
              intent,
            };
          }
          const preview = cats
            .slice(0, 2)
            .map(
              (c: any) =>
                `${sanitizeOutput(c.categoryName || 'Menu')}:\n${c.items
                  .slice(0, 3)
                  .map(
                    (i: any) => `• ${sanitizeOutput(i.name)} - Rs. ${i.price}`,
                  )
                  .join('\n')}`,
            )
            .join('\n\n');
          const response = sanitizeOutput(
            `Here's menu 🍽️\n\n${preview}\n\nWant item details?`,
          );
          this.saveHistory(historyKey, history, message, response);
          return {
            response,
            quickReplies: ['Show more', 'Is this restaurant open?', 'Help'],
            intent,
          };
        }
        let searchTerm = message
          .replace(/show|menu|dish|what|is|the|on|for|me/gi, '')
          .trim();
        if (!searchTerm || searchTerm.length < 2) searchTerm = message.trim();
        if (['momo', 'pizza'].includes(lower.trim())) searchTerm = lower.trim();
        const data = await this.invokeTool(
          this.menuTools.getSearchMenuItemsTool(),
          searchTerm.slice(0, 50),
        );
        const results = data.results || [];
        if (!results.length) {
          const response =
            "Tell me dish (e.g., 'momo', 'pizza', 'biryani') to search! 🔍";
          this.saveHistory(historyKey, history, message, response);
          return {
            response,
            quickReplies: ['Show popular restaurants', 'Find food'],
            intent,
          };
        }
        const formatted = results
          .slice(0, 5)
          .map(
            (r: any) =>
              `• ${sanitizeOutput(r.name)} - Rs. ${r.price} at ${sanitizeOutput(r.restaurantName)}`,
          )
          .join('\n');
        const response = sanitizeOutput(`Found dishes 🍔\n\n${formatted}`);
        this.saveHistory(historyKey, history, message, response);
        return { response, quickReplies: ['Show restaurants', 'Help'], intent };
      }
        if (
          intent === 'restaurant_availability' ||
          lower.includes('open') ||
          lower.includes('closed') ||
          lower.includes('hours')
        ) {
          if (context?.restaurantId) {
            const data = await this.invokeTool(
              this.restaurantTools.getRestaurantAvailabilityTool(),
              context.restaurantId,
            );
            if (data.error) throw new Error(data.error);
            const response = sanitizeOutput(
              data.isOpen
                ? `✅ This restaurant is currently **open** 🟢`
                : `🔴 This restaurant is currently **closed**`,
            );
            this.saveHistory(historyKey, history, message, response);
            return { response, quickReplies: ['Show menu', 'Help'], intent };
          }
          const response =
            "Which restaurant's availability? Share a restaurant name or ID. 🏪";
          this.saveHistory(historyKey, history, message, response);
          return { response, quickReplies: ['Show popular restaurants', 'Help'], intent };
        }
        if (
          intent === 'pricing_query' ||
          lower.includes('price') ||
          lower.includes('cost') ||
          lower.includes('fee')
        ) {
          if (context?.restaurantId) {
            const data = await this.invokeTool(
              this.restaurantTools.getRestaurantDetailsTool(),
              context.restaurantId,
            );
            if (data.error) throw new Error(data.error);
            const response = sanitizeOutput(
              `📋 **${sanitizeOutput(data.name)}** pricing:\n` +
              `• Delivery fee: Rs. ${data.deliveryFee || 0}\n` +
              `• Minimum order: Rs. ${data.minimumOrderAmount || 0}\n` +
              `• Rating: ⭐ ${data.rating || 'N/A'}\n` +
              `${data.isOpen ? '🟢 Open' : '🔴 Closed'}`,
            );
            this.saveHistory(historyKey, history, message, response);
            return { response, quickReplies: ['Show menu', 'Help'], intent };
          }
          const response =
            "Which restaurant's pricing? Share a restaurant name or ID. 💰";
          this.saveHistory(historyKey, history, message, response);
          return { response, quickReplies: ['Show popular restaurants', 'Help'], intent };
        }
        if (
          intent === 'order_tracking' ||
          intent === 'order_history' ||
          lower.includes('order') ||
          lower.includes('delivery') ||
          lower.includes('track')
        ) {
         const isDetailsRequest = ['detail', 'details', 'info', 'information', "what's in", 'contains', 'items in', 'item list'].some((w) => lower.includes(w));
         if (context?.orderId) {
           const tool = isDetailsRequest ? this.orderTools.getOrderDetailsTool() : this.orderTools.getOrderStatusTool();
           const data = await this.invokeTool(tool, context.orderId);
           if (data.error) {
             const response = `Order ${context.orderId.slice(0, 8)} not found. Check ID? 📦`;
             this.saveHistory(historyKey, history, message, response);
             return {
               response,
               quickReplies: ['Order history', 'Help'],
               intent,
             };
           }
           if (isDetailsRequest && data.items) {
             const itemsStr = data.items.map((i: any) => `  • ${i.name} × ${i.quantity} — Rs. ${i.price}`).join('\n');
             const response = sanitizeOutput(
               `Order #${data.id.slice(0, 8)} — **${data.status}** 📦\n` +
               `Customer: ${data.customerName}\n` +
               `Total: Rs. ${data.totalAmount}\n` +
               `Delivery: ${data.deliveryAddress}\n` +
               `ETA: ${data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleString() : 'N/A'}\n` +
               `\nItems:\n${itemsStr}`,
             );
             this.saveHistory(historyKey, history, message, response);
             return {
               response,
               quickReplies: ['Track delivery', 'Order history', 'Help'],
               intent,
             };
           }
           const response = sanitizeOutput(
             `Order #${data.id.slice(0, 8)} is **${data.status}** 🚚\nTotal: Rs. ${data.totalAmount}${data.estimatedDelivery ? `\nETA: ${new Date(data.estimatedDelivery).toLocaleString()}` : ''}`,
           );
           this.saveHistory(historyKey, history, message, response);
           return {
             response,
             quickReplies: ['Track delivery', 'Order history', 'Help'],
             intent,
           };
         }
         if (lower.includes('history')) {
           const data = await this.invokeTool(
             this.orderTools.getOrderHistoryTool(),
             '',
           );
           const orders = data.orders || [];
           if (!orders.length) {
             const response = 'No orders yet. Explore restaurants? 🍕';
             this.saveHistory(historyKey, history, message, response);
             return {
               response,
               quickReplies: ['Show popular restaurants', 'Find food'],
               intent,
             };
           }
           const formatted = orders
             .map(
               (o: any) =>
                 `• Order #${o.id.slice(0, 8)} - ${o.status} (Rs. ${o.totalAmount})`,
             )
             .join('\n');
           const response = sanitizeOutput(`Recent orders 📋\n\n${formatted}`);
           this.saveHistory(historyKey, history, message, response);
           return { response, quickReplies: ['Track order', 'Help'], intent };
         }
         if (lower.includes('detail') || lower.includes('details') || lower.includes('info') || lower.includes('info about my order')) {
           const data = await this.invokeTool(
             this.orderTools.getOrderHistoryTool(),
             '',
           );
           const orders = data.orders || [];
           if (!orders.length) {
             const response = 'No orders found. Share an order ID to see details. 📦';
             this.saveHistory(historyKey, history, message, response);
             return { response, quickReplies: ['Order history', 'Help'], intent };
           }
           const formatted = orders
             .slice(0, 5)
             .map(
               (o: any) =>
                 `• Order #${o.id.slice(0, 8)} — ${o.status} (Rs. ${o.totalAmount})\n  Items: ${o.items?.map((i: any) => i.name).join(', ') || 'N/A'}`,
             )
             .join('\n');
           const response = sanitizeOutput(`Your recent orders 📋\n\n${formatted}`);
           this.saveHistory(historyKey, history, message, response);
           return { response, quickReplies: ['Order history', 'Help', 'Show restaurants'], intent };
         }
         const response =
           "I can track order! Share order ID or say 'order history'. 📦";
         this.saveHistory(historyKey, history, message, response);
         return {
           response,
           quickReplies: ['Order history', 'Help', 'Show restaurants'],
           intent,
         };
       }
      const wordCount = message.trim().split(/\s+/).length;
      const isShortFoodQuery =
        wordCount <= 3 &&
        !lower.includes('order') &&
        !lower.includes('restaurant') &&
        !lower.includes('popular') &&
        !lower.includes('track');
      if (isShortFoodQuery && message.trim().length >= 2) {
        const data = await this.invokeTool(
          this.menuTools.getSearchMenuItemsTool(),
          message.trim().slice(0, 50),
        );
        if (!data.error && data.results?.length) {
          const formatted = data.results
            .slice(0, 5)
            .map(
              (r: any) =>
                `• ${sanitizeOutput(r.name)} - Rs. ${r.price} at ${sanitizeOutput(r.restaurantName)}`,
            )
            .join('\n');
          const response = sanitizeOutput(
            `Found dishes for "${sanitizeForPrompt(message.trim())}" 🍔\n\n${formatted}`,
          );
          this.saveHistory(historyKey, history, message, response);
          return {
            response,
            quickReplies: ['Show restaurants', 'Help'],
            intent: 'menu_query',
          };
        }
      }
      const response = `Hello! I'm KhanaGo 🤖🍕\n\nI help with:\n• Find restaurants\n• Show menus\n• Check open status\n• Track orders\n\nWhat would you like?`;
      this.saveHistory(historyKey, history, message, response);
      return {
        response,
        quickReplies: [
          'Show popular restaurants',
          'Find food',
          'Track order',
          'Help',
        ],
        intent: 'general',
      };
    } catch (e: any) {
      const response =
        "Tell me more – e.g., 'Show Nepali restaurants' or 'Track my order'. 😊";
      this.saveHistory(historyKey, history, message, response);
      return {
        response,
        quickReplies: ['Show restaurants', 'Find food', 'Help'],
        intent,
      };
    }
  }

  private saveHistory(
    key: string,
    history: any[],
    userMsg: string,
    aiMsg: string,
  ) {
    this.evictIfNeeded(key);
    const newHistory = [
      ...history,
      new HumanMessage(sanitizeForPrompt(userMsg)),
      new AIMessage(sanitizeOutput(aiMsg)),
    ];
    this.sessionHistories.set(key, newHistory.slice(-MAX_HISTORY_PER_SESSION));
  }

  private generateQuickReplies(
    response: string,
    context?: { restaurantId?: string; orderId?: string },
  ): string[] {
    const replies = ['Show popular restaurants', 'Find food', 'Help'];
    if (
      response.toLowerCase().includes('restaurant') ||
      response.toLowerCase().includes('food')
    )
      replies.push("What's on the menu?");
    if (
      response.toLowerCase().includes('order') ||
      response.toLowerCase().includes('delivery')
    )
      replies.push('Track my order');
    if (context?.restaurantId) {
      replies.push('Is this restaurant open?');
      replies.push('Show menu');
    }
    return [...new Set(replies)].slice(0, 4);
  }

  private detectIntent(message: string): string {
    const lower = sanitizeForPrompt(message).toLowerCase();
    if (
      lower.includes('restaurant') ||
      lower.includes('food') ||
      lower.includes('eat')
    ) {
      if (
        lower.includes('popular') ||
        lower.includes('best') ||
        lower.includes('top')
      )
        return 'popular_restaurants';
      if (
        lower.includes('open') ||
        lower.includes('closed') ||
        lower.includes('hours')
      )
        return 'restaurant_availability';
      return 'search_restaurants';
    }
    if (
      lower.includes('menu') ||
      lower.includes('item') ||
      lower.includes('dish')
    )
      return 'menu_query';
    if (
      lower.includes('order') ||
      lower.includes('delivery') ||
      lower.includes('track')
    ) {
      if (lower.includes('status') || lower.includes('track'))
        return 'order_tracking';
      if (lower.includes('history')) return 'order_history';
      return 'order_query';
    }
    if (
      lower.includes('price') ||
      lower.includes('cost') ||
      lower.includes('fee')
    )
      return 'pricing_query';
    return 'general';
  }

  clearHistory(key: string) {
    this.sessionHistories.delete(key);
  }
}
