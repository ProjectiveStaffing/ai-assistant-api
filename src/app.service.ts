import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureOpenAI } from 'openai';

// Define la estructura esperada para la solicitud REST
interface ChatRequestDto {
  prompt: string;
}

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private client: AzureOpenAI;
  private readonly deploymentName: string;

  constructor(private configService: ConfigService) {
    // 1. Obtener las variables de entorno
    const endpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT');
    const apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    const apiVersion = this.configService.get<string>('AZURE_OPENAI_API_VERSION');

    this.deploymentName = this.configService.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME') || '';

    if (!endpoint || !apiKey || !this.deploymentName || !apiVersion) {
      this.logger.error('Faltan variables de entorno para Azure OpenAI. Verifica tu archivo .env.');
      throw new Error('Configuración de Azure OpenAI incompleta.');
    }

    // 2. Inicializar el cliente de AzureOpenAI
    this.client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion,
      deployment: this.deploymentName // Usar el nombre del deployment
    });

    this.logger.log(`Cliente de AzureOpenAI inicializado para deployment: ${this.deploymentName}`);
  }

  /**
   * Realiza una llamada al modelo de Chat Completions.
   * @param chatRequest Objeto con el prompt del usuario.
   * @returns El contenido de la respuesta de la IA.
   */
  async getChatCompletion({ prompt }: ChatRequestDto): Promise<string> {

    // En src/openai/openai.service.ts, dentro de la constante SYSTEM_INSTRUCTION
const SYSTEM_INSTRUCTION = `Hello, you are an AI agent dedicated to task management. Your duty is to identify in the conversation with the user, the name of the assigned task(s), identify the people mentioned in it, identify and categorize the task according to the type (family, work, or other), identify the date to perform it.

Crucial Instruction: YOU MUST RESPOND ONLY with a valid JSON object matching the following TypeScript structure. DO NOT include any introductory or conversational text, markdown formatting (like triple backticks \`\`\`), or extra characters outside of the JSON object.

JSON STRUCTURE:
{
  "taskName": [string],
  "peopleInvolved": [string],
  "taskCategory": ["Family" | "Work" | "Other"],
  "dateToPerform": string,
  "modelResponse": string
}`;
    try {
      const result = await this.client.chat.completions.create({
        // El nombre del modelo debe ir en `model` al usar el SDK con Azure
        model: this.deploymentName,
        messages: [
          {
            role: "system",
            content: SYSTEM_INSTRUCTION,
          },
          {
            role: "user",
            content: prompt
          }
        ],
        // Parámetros del modelo (ajustados a tu código original)
        max_tokens: 13107,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null
      });

      // El resultado más relevante es el primer choice
      const responseContent = result.choices[0]?.message?.content;

      if (!responseContent) {
        throw new Error("La respuesta de la IA no contenía contenido de mensaje.");
      }

      return responseContent;

    } catch (error) {
      this.logger.error(`Error al llamar a Azure OpenAI: ${error.message}`, error.stack);
      // Lanza una excepción estándar de NestJS para manejar el error HTTP
      throw new InternalServerErrorException('Error al procesar la solicitud con el servicio de IA.');
    }
  }
}
