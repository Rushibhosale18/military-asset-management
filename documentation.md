# KristalBall Military Asset Management System
## Documentation

### Project Overview
The KristalBall Military Asset Management System is a centralized, secure web application designed for military commanders and logistics personnel. It tracks critical assets across multiple bases, manages inter-base transfers, and tracks deployments to individual operators.

### Tech Stack & Architecture
- **Frontend**: React.js (Create React App), TailwindCSS, Axios, Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: SQLite3 (chosen for portable, fast setup without MongoDB dependency).
- **Architecture**: REST API architecture with a stateless JWT-based authentication system.

### Data Models / Schema
1. **Users**: `id`, `username`, `password` (hashed), `role`.
2. **Assets**: `id`, `name`, `category`, `base`, `quantity`, `description`.
3. **Transfers**: `id`, `assetId` (FK), `fromBase`, `toBase`, `quantity`, `status`, `requestedBy` (FK).
4. **Assignments**: `id`, `assetId` (FK), `assignedTo`, `purpose`, `quantity`, `status`, `base`, `assignedBy` (FK).

### RBAC Explanation (Role-Based Access Control)
- **Admin**: Full access. Can add/purchase new assets, approve/reject transfers, deploy hardware.
- **Base Commander**: Can deploy hardware, request inter-base transfers, and view assets at their base.
- **Logistics Officer**: Can view all assets system-wide, request transfers, and approve/complete transfers.

### API Logging
- Requests are processed through standard Express routes.
- Access checks are performed by the `auth.js` middleware checking the `Bearer` token.
- SQLite handles local file-based database logging.

### Setup Instructions
1. Download or clone the repository.
2. Open two terminal windows.
3. **Run Backend**:
   - \`cd backend\`
   - \`npm install\`
   - \`npm start\` (or \`node index.js\`)
   - Runs on \`http://localhost:5000\`
4. **Run Frontend**:
   - \`cd frontend\`
   - \`npm install\`
   - \`npm start\`
   - Runs on \`http://localhost:3000\`

### API Endpoints
- **Auth**: \`POST /api/auth/login\`, \`GET /api/auth/me\`
- **Assets**: \`GET /api/assets\`, \`GET /api/assets/:id\`, \`POST /api/assets\`, \`PUT /api/assets/:id\`
- **Transfers**: \`GET /api/transfers\`, \`POST /api/transfers\`, \`PUT /api/transfers/:id/status\`
- **Assignments**: \`GET /api/assignments\`, \`POST /api/assignments\`, \`PUT /api/assignments/:id/status\`

### Login Credentials
- **Admin**: USER: \`admin\` | PASSKEY: \`admin123\`
- **Base Commander**: USER: \`commander\` | PASSKEY: \`commander123\`
- **Logistics Officer**: USER: \`logistics\` | PASSKEY: \`logistics123\`
