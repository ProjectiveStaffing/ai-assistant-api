import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OpenaiService } from './app.service';

// Data Transfer Object (DTO) para validar la entrada
class ChatRequestDto {
    prompt: string;
}

// Data Transfer Object (DTO) para la salida
interface ChatResponseDto {
    response: string;
}

@Controller('openai') // Ruta base: /openai
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('chat') // Ruta completa: POST /openai/chat
  @HttpCode(HttpStatus.OK)
  async createChatCompletion(@Body() body: ChatRequestDto): Promise<ChatResponseDto> {
    // Nota: En un proyecto real, usarías ValidationPipe y class-validator/transformer
    // para validar automáticamente el DTO. Por ahora, asumimos que 'prompt' existe.

    const responseText = await this.openaiService.getChatCompletion(body);
    
    // Devolver una respuesta estructurada
    return {
        response: JSON.parse(responseText),
    };
  }
}
