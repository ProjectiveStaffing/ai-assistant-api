import { NestFactory } from '@nestjs/core';
import { OpenaiModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(OpenaiModule);

  app.enableCors({
  origin: ['http://localhost:3000',
    'https://ai-assistant-6yceqcyen-projective-staffings-projects.vercel.app',
    'https://ai-assistant-one-liard.vercel.app/' 
  ], // Orígenes permitidos
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
  credentials: false, // Si manejas cookies o autenticación basada en encabezados
});

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
