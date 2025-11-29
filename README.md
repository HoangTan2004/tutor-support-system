# tutor-support-system

## To Run the Project

### 🌱 Seed the Database
```bash
cd integrations/hcmut_datacore
node seed.js
```

### 🖥 Start the Server (backend)

```bash
cd backend
npm run dev
```

Backend runs at:

```arduino
http://localhost:4000
```

### 🖥 Start the HCMUT_SSO Service (separate backend)

```bash
cd integrations/hcmut_sso
node server.js
```

Service runs at:

```arduino
http://localhost:5001
```

### 🌐 Start the Client (frontend)

```bash
cd client
npm run dev
```

Frontend runs at:

```arduino
http://localhost:5173
```
