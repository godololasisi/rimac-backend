# Rimac Appointment Backend – Reto Técnico

![Node](https://img.shields.io/badge/node-18.x-blue)
![Serverless](https://img.shields.io/badge/serverless-framework-orange)
![Status](https://img.shields.io/badge/status-local--ready-green)
Este proyecto corresponde al **Reto Técnico Back End** para la aplicación de **agendamiento de cita médica para asegurados** de Rimac.

## Descripción del Negocio

Un asegurado ingresa a una aplicación web para agendar una cita médica eligiendo:

- Centro médico
- Especialidad
- Médico
- Fecha y hora

La aplicación backend recibe estos datos y devuelve un mensaje de que la solicitud está en proceso. Se da soporte a Perú (PE) y Chile (CL).

## Objetivo

Construir una solución backend en AWS que procese solicitudes de agendamiento considerando un flujo distinto por país.

---

## Tecnologías Usadas

- **Node.js** + **TypeScript**
- **Serverless Framework**
- **DynamoDB Local** (modo offline)
- **SNS / SQS / EventBridge** (simulados/locales)
- **Postman** (para pruebas de integración)
- **Swagger (OpenAPI)** (documentación)
- Arquitectura **limpia (Clean Architecture)** y principios **SOLID**

---

## Estructura de Carpetas (Resumen)

```bash
rimac-appointment-backend/
├── src/
│   ├── handlers/               # Lambdas para cada paso del flujo
│   └── ...                    # Casos de uso, servicios, modelos
├── serverless.yml             # Infraestructura AWS (offline)
├── createTable.ts             # Crea tabla DynamoDB local
├── package.json / tsconfig.json
```

---

## 🔁 Flujo de Agendamiento

1. **POST /appointments**: Crea el agendamiento en DynamoDB con estado `pending`.
2. Se envía un mensaje a un **SNS topic**, según el país (`PE`, `CL`).
3. El **SNS** enruta el mensaje a la cola **SQS** correspondiente (`PeruQueue`, `ChileQueue`).
4. El Lambda `appointmentPE` o `appointmentCL` recibe el mensaje y registra el agendamiento en RDS (simulado).
5. Se publica la confirmación a través de **EventBridge**, que termina en otra **SQS**.
6. Lambda `appointmentConfirm` lee esa cola y cambia el estado en DynamoDB a `completed`.

---

## Evidencia de Funcionamiento

### 1. DynamoDB corriendo localmente

![DynamoDB]

### 2. POST /appointments (registro exitoso)

![Postman POST]

### 3. GET /appointments/{insuredId} (consulta exitosa)

![Postman GET]

---

## Instrucciones para Ejecutar Localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar DynamoDB local (en una terminal separada)

```bash
java -jar dynamodb-local/DynamoDBLocal.jar -port 8000 -sharedDb
```

### 3. Crear tabla DynamoDB

```bash
npx ts-node createTable.ts
```

### 4. Levantar entorno offline

```bash
npx serverless offline --stage dev --isOffline true
```

---

## 📮 Endpoints

### POST `/appointments`

```json
{
  "insuredId": "00013",
  "scheduleId": 90,
  "countryISO": "PE"
}
```

📥 **Respuesta:**

```json
{
  "message": "Appointment registered, processing",
  "appointmentId": "c6eaff7c-b48d-49f7-a348-22f93aeb0923"
}
```

---

### GET `/appointments/{insuredId}`

🔍 Retorna todas las citas del asegurado, incluyendo el estado (`pending` o `completed`).

---

## Documentación OpenAPI

Archivo `swagger.yaml` incluido para importar en Swagger UI o Postman.

---

## Pruebas Unitarias

Incluye soporte para pruebas con Jest. Ejecutar con:

```bash
npm test
```

---

## 🧠 Consideraciones

- El procesamiento es simulado localmente (SNS, SQS, EventBridge).
- Se usa DynamoDB local como almacenamiento principal.
- El RDS es asumido como existente (conexión simulada).
- No se implementa la lógica de reintentos o fallas de agendamiento.

---

## 📎 Archivo del Reto Técnico

Se incluye el PDF original: [`Reto - Rimac Backend.pdf`]

---

## Autor y Entrega

- Proyecto desarrollado como solución técnica del reto Rimac.
- Código: [Repositorio privado / entregable]
- Documentación y ejecución validadas en entorno local.
