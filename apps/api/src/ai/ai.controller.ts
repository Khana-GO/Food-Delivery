import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  Get,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ChatMessageDto, ChatResponseDto } from './dto/chat-message.dto';

@ApiTags('AI Chatbot')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @ApiOperation({ summary: 'Send a message to the AI chatbot' })
  async chat(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChatMessageDto,
  ): Promise<ChatResponseDto> {
    return this.aiService.processChat({
      message: dto.message,
      userId: user.sub,
      sessionId: dto.sessionId,
      context: dto.context,
    });
  }

  @Delete('session/:sessionId')
  @ApiOperation({ summary: 'Clear chat session history' })
  @ApiParam({ name: 'sessionId', type: 'string', format: 'uuid' })
  async clearSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' })) sessionId: string,
  ): Promise<{ message: string }> {
    await this.aiService.clearSession(sessionId, user.sub);
    return { message: 'Session cleared' };
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get chat session history' })
  @ApiParam({ name: 'sessionId', type: 'string', format: 'uuid' })
  async getSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' })) sessionId: string,
  ): Promise<any> {
    const history = await this.aiService.getHistory(sessionId, user.sub);
    if (!history) return { sessionId, messages: [] };
    return history;
  }
}
