# Hotel Support Chatbot

Support Chatbot สำหรับลูกค้าที่ใช้งาน Hotel Management Software
ใช้ RAG (Retrieval-Augmented Generation) กับ Claude API และ Azure AI Search

## โครงสร้างโปรเจกต์

```
hotel-support-chatbot/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite Chat UI
├── pdfs/             # วาง PDF ไฟล์ FAQ/ปัญหาที่นี่
└── README.md
```

## การติดตั้งและตั้งค่า

### 1. ตั้งค่า Environment Variables

```bash
cd backend
cp .env.example .env
# แก้ไขค่าใน .env ให้ครบ
```

ค่าที่ต้องกรอก:
| Variable | ที่มา |
|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com |
| `AZURE_SEARCH_ENDPOINT` | Azure Portal → AI Search → Overview |
| `AZURE_SEARCH_API_KEY` | Azure Portal → AI Search → Keys |
| `AZURE_SEARCH_INDEX_NAME` | ตั้งชื่อเอง เช่น `hotel-support-index` |
| `OPENAI_API_KEY` | https://platform.openai.com (ใช้สำหรับ embeddings) |

### 2. นำเข้า PDF ลงใน Knowledge Base

```bash
# วาง PDF ทั้งหมดไว้ในโฟลเดอร์ pdfs/
cd backend
npm run ingest
```

### 3. รัน Backend

```bash
cd backend
npm run dev
# Server จะรันที่ http://localhost:3001
```

### 4. รัน Frontend

```bash
cd frontend
npm run dev
# เปิด http://localhost:5173
```

## Azure AI Search Setup

1. สร้าง Azure AI Search resource ใน Azure Portal (tier: Free หรือ Basic)
2. คัดลอก Endpoint และ Admin Key มาใส่ใน `.env`
3. รัน `npm run ingest` — script จะสร้าง index ให้อัตโนมัติ

## Azure Deployment

| Component | Service |
|---|---|
| Backend | Azure App Service (Node.js 20) |
| Frontend | Azure Static Web Apps |
| Vector Search | Azure AI Search |

### Deploy Backend (App Service)
```bash
cd backend
az webapp up --name <app-name> --runtime "NODE:20-lts"
# ตั้งค่า environment variables ใน App Service → Configuration
```

### Deploy Frontend (Static Web Apps)
```bash
cd frontend
npm run build
# อัปโหลด dist/ ไปยัง Azure Static Web Apps
```
