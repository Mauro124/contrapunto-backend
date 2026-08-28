# Contrapunto Backend

Servicio backend basado en Firebase Cloud Functions y Google Genkit para el análisis avanzado de noticias, detección de sesgos ideológicos, verificación de hechos y contraste de cobertura con fuentes alternativas.

## Stack Tecnológico

- **Runtime:** Node.js 22
- **Framework:** Firebase Cloud Functions (2nd Gen)
- **IA Orchestration:** Google Genkit (v1)
- **AI SDK:** `@genkit-ai/google-genai` (Reemplazo oficial de `@genkit-ai/googleai`)
- **Modelos:** Gemini 3.6 Flash (Principal) & Gemini 3.5 Flash (Fallback)
- **Servicios Integrados:** Google Search Grounding (Búsqueda y contraste de noticias en tiempo real al estilo NotebookLM)

## Estructura del Proyecto

```text
├── firebase.json          # Configuración del CLI de Firebase
├── .firebaserc            # Definición del proyecto activo
└── functions/             # Directorio de la Cloud Function
    ├── .env               # Variables de entorno locales (API keys)
    ├── package.json       # Dependencias del backend
    ├── tsconfig.json      # Configuración de TypeScript
    └── src/
        ├── index.ts       # Punto de entrada de la Cloud Function HTTPS
        ├── interfaces/    # Definiciones de tipos y contratos (types.ts)
        ├── services/      # Lógica de negocio (RSS y matcher de artículos)
        └── utils/         # Utilidades de Genkit e integración de modelos
```

## Configuración Inicial

### Prerrequisitos

Tener instalado Node.js (v22+) y el Firebase CLI:
```bash
npm install -g firebase-tools
```

### Configuración del archivo `.env`

Crear un archivo `.env` en la carpeta `functions/` y configurar la API Key de Gemini:
```env
GEMINI_API_KEY=tu_api_key_aqui
```

*Nota: Esta API Key se inyecta automáticamente en las Cloud Functions durante el despliegue.*

## Desarrollo y Comandos Útiles

Ejecutar todos los comandos dentro de la carpeta `functions/`:

### 1. Instalar dependencias
```bash
npm install
```

### 2. Compilar TypeScript
```bash
npm run build
```

### 3. Ejecutar servidor de desarrollo local
```bash
npm run dev
```

### 4. Desplegar en Firebase Functions
```bash
npm run deploy
```

## Endpoints

### POST `/generateNewsInsightsFunction`
Analiza una noticia a partir de su URL.
- **Body:** `{ "url": "https://url-de-la-noticia.com" }`
- **Output:** JSON estructurado que incluye análisis de sesgo político, veracidad, glosario, extracción de datos numéricos y noticias similares de otros medios (mediante búsqueda y grounding en tiempo real).
