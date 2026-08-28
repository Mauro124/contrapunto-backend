# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-28

### Added
- Integración de **Google Search Grounding** para permitir la búsqueda y contraste de noticias similares en tiempo real.
- Estructuración de datos para coberturas de noticias similares en la interfaz `SingleNewsAnalysisResult` a través del campo `similarNewsCoverage`.
- Script de npm `"deploy"` en `package.json` para facilitar el despliegue automático de las Cloud Functions.

### Changed
- Migración del SDK de Genkit: reemplazado el plugin obsoleto `@genkit-ai/googleai` por el nuevo plugin recomendado `@genkit-ai/google-genai`.
- Actualización de los modelos de Gemini: migrados de la serie deprecada 1.5 y 2.0 a los modelos estables más potentes de la serie 3.x (`gemini-3.6-flash` como principal, `gemini-3.5-flash` como fallback).
- Actualización de lógica de reintentos para que intente los modelos de forma secuencial por orden de prioridad y potencia, en lugar de seleccionarlos de manera aleatoria.
- Modificación del prompt de análisis para pasar la URL del artículo como texto plano, evitando errores de tipo de argumento inválido (`INVALID_ARGUMENT`) al usar el formato `media` en páginas HTML.

## [1.0.0] - 2026-08-27

### Added
- Versión inicial del backend de Contrapunto.
- Función HTTPS de Firebase para el análisis de noticias individuales.
- Lógica básica de sesgo político, verificación de hechos, glosario y actor favorecido.
- Soporte para parsear feeds de RSS y realizar matching simple entre noticias locales.
