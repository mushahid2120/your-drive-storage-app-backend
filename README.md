<img src="your-drive.svg" align="left" width="48" hspace="10" alt="App Icon">

# Your Drive — Backend

A secure, session-based storage backend built with Node.js, Express, and MongoDB — supporting direct-to-S3 uploads, CloudFront signed downloads, OTP email signup, Google login, paid subscription plans via Razorpay, and admin operations.

<a href="https://cf.mushahidjs.dpdns.org">
  <h2 style="display: inline;">Live Demo 🚀</h2>
</a>

## 🚀 Features

### Core Features
- **Authentication**: email/password signup with OTP verification, session-based login, and Google OAuth login
- **Session management**: server-side sessions (not just stateless JWT) backed by a `Session` collection, so sessions can be invalidated on demand — includes "logout" and "logout all devices"
- **File storage**: direct-to-S3 uploads (client uploads straight to S3 via a pre-signed URL, not proxied through the server), CloudFront signed URLs for secure downloads, rename/delete with storage accounting
- **Directory management**: nested folders, rename, and recursive delete with storage quota recalculation
- **Subscription & billing**: Razorpay-powered checkout for Pro/Premium plans (monthly or yearly billing), plan upgrades, and cancellation — each plan maps to an increased storage quota
- **Payment webhooks**: signature-verified Razorpay webhook confirms payment success/failure server-side and updates the user's plan and storage capacity accordingly
- **Admin tools**: list all users, force-logout a user, soft-delete and hard-delete accounts, role-based access control

### Security Features
- **Password hashing**: bcrypt
- **HTTP hardening**: Helmet
- **Rate limiting & slow-down**: `express-rate-limit` + `express-slow-down` on all routes
- **Input validation**: Zod schemas for auth payloads, plus an `:id` param validator middleware to reject malformed Mongo ObjectIds before they hit a controller
- **Ownership checks**: role-based middleware (`checkAuth`, `checkRole`, `checkAdminUser`) gates admin-only and self-only actions

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose
- **Cache/session store**: Redis
- **Auth**: Session cookies (`cookie-parser`), Google OAuth (`google-auth-library`)
- **File storage**: AWS S3 (`@aws-sdk/client-s3`, `s3-request-presigner`) + AWS CloudFront (`cloudfront-signer`, `client-cloudfront`)
- **Payments**: Razorpay
- **Email (OTP)**: Brevo
- **Validation**: Zod
- **Deployment**: Node server (Render) or AWS Lambda (`serverless-http`) — both from the same codebase

## 📁 Project Structure

```
your-drive-storage-app-backend/
├─ app.js                # Express app, middleware & route mounting
├─ server.js               # entrypoint for traditional server deployment
├─ lambda.js                # entrypoint for AWS Lambda deployment
├─ package.json
├─ .env (not committed)
├─ config/
│  ├─ env.js               # loads dotenv
│  ├─ db.js                 # MongoDB connection
│  ├─ dbSetup.js             # one-off DB init script
│  └─ redis.js
├─ Controller/
│  ├─ userController.js      # signup/login/logout/admin user actions
│  ├─ fileController.js       # upload init/complete, rename, delete, get
│  ├─ dirController.js         # directory CRUD
│  ├─ otpController.js
│  ├─ subscriptionController.js  # Razorpay checkout, upgrade, cancel
│  └─ webhookController.js        # Razorpay webhook handler
├─ Model/
│  ├─ userModel.js
│  ├─ fileModel.js
│  ├─ dirModel.js
│  ├─ otpModel.js
│  ├─ sessionModel.js
│  └─ SubscriptionModel.js
├─ routes/
│  ├─ userRoutes.js           # mounted at /auth
│  ├─ fileRoutes.js            # mounted at /files
│  ├─ dirRoutes.js              # mounted at /directory
│  ├─ otpRoutes.js               # mounted at /otp
│  ├─ subscriptionRoutes.js       # mounted at /subscriptions
│  └─ webhooksRoutes.js            # mounted at /webhooks
├─ service/
│  ├─ aws_s3.js             # pre-signed upload URLs
│  ├─ aws_cf.js               # CloudFront signed URLs
│  └─ sendOtp.js
├─ middleware/
│  ├─ authCheckMW.js         # checkAuth, checkRole, checkAdminUser
│  └─ validateIdMW.js
└─ validator/
   └─ authSchemaZod.js
```

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud instance)
- Redis
- AWS account with an S3 bucket + CloudFront distribution
- Razorpay account (for subscriptions)
- Brevo account (for OTP emails)
- Google OAuth client ID

### Installation

```bash
git clone https://github.com/mushahid2120/your-drive-storage-app-backend.git
cd your-drive-storage-app-backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DB_URL=mongodb://localhost:27017/yourdrive
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your_session_secret
COOKIE_SAMESITE=Strict

# AWS
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_KEY_ID=your_aws_secret_key
AWS_REGION=ap-south-1
BUCKET_NAME=your_s3_bucket_name
CLOUDFRONT_KEY=your_cloudfront_signing_key

# Email (OTP)
BREVO_KEY_ID=your_brevo_api_key
SENDER_EMAIL=your_verified_sender_email

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Razorpay
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET_KEY=your_razorpay_key_secret
RAZORPAY_SECRET=your_razorpay_webhook_secret
```

### Running Locally

```bash
npm run dev       # watch mode via node --watch
npm run dbsetup    # optional: one-off DB initialization
npm start          # production start (server.js)
```

- Dev script: `npm run dev` (runs `server.js` with `node --watch`)
- Start (production): `npm start`
- Serverless: `lambda.js` is the handler entrypoint when deployed to AWS Lambda via `serverless-http`

## 📡 API Endpoints

### Auth Routes (`/auth`)
- `POST /singup` — user signup
- `POST /login` — email/password login
- `POST /login-with-google` — Google OAuth login
- `POST /logout` — log out current session
- `POST /logout-all` — invalidate all sessions for the user
- `GET /` — get current authenticated user
- `GET /allusers` — list all users *(admin only)*
- `POST /logout-user/:userId` — force-logout a specific user *(admin only)*
- `DELETE /hard-delete-user/:userId` — permanently delete an account
- `DELETE /soft-delete-user/:userId` — soft-delete an account *(admin only)*

### OTP Routes (`/otp`)
- `POST /send` — send a signup verification OTP

### Directory Routes (`/directory`)
- `GET /:id` — list directory contents
- `POST /:parentDirId` — create a new directory
- `PATCH /:folderId` — rename a directory
- `DELETE /:folderId` — delete a directory (recursive)

### File Routes (`/files`)
- `GET /:id` — get file details/download link
- `POST /init/:parentDirId` — initiate a direct-to-S3 upload (returns pre-signed URL)
- `PUT /complete/:fileId` — finalize an upload after the S3 PUT completes
- `PATCH /:id` — rename a file
- `DELETE /:id` — delete a file

### Subscription Routes (`/subscriptions`)
- `GET /` — get the current user's subscription (defaults to `"Free"` plan)
- `POST /` — create a Razorpay order for a Pro/Premium subscription
- `PUT /upgrade` — create a Razorpay order to upgrade to Premium
- `DELETE /` — cancel the current subscription (resets storage quota)

### Webhook Routes (`/webhooks`)
- `POST /storageapp` — Razorpay payment webhook (signature-verified)

## 🔐 Authentication

Unlike a pure JWT setup, sessions are server-managed:

1. **Signup**: user registers, receives an OTP by email, and verifies it before the account is activated
2. **Login**: email/password or Google OAuth creates a session record and sets a signed, httpOnly session cookie
3. **Session validation**: `checkAuth` middleware looks up the session on each request
4. **Revocation**: because sessions are stored server-side, `logout-all` or an admin `logout-user` action takes effect immediately — no waiting for a token to expire

## 💳 Payment Integration

Integrated with Razorpay for subscription billing:

- **Order creation**: `createSubscription` computes the price for the selected plan/billing cycle and creates a Razorpay order
- **Upgrade flow**: a separate `upgradeSubscription` endpoint creates an order to move Pro → Premium
- **Webhook verification**: `handleRazorpayWebhook` validates the `x-razorpay-signature` header before trusting any payload
- **Quota updates**: on a confirmed payment, the webhook updates the subscription's status/expiry and raises the user's storage `capacity` (e.g. 100MB for Pro/monthly, 200MB for Premium)
- **Cancellation**: deletes the subscription record and resets the user's storage quota back to the free tier

## 🖼️ File Storage & Delivery

- **Direct-to-S3 uploads**: the backend issues a pre-signed S3 PUT URL (`uploadFileInit`) so large files upload directly from the browser to S3, not through the Node server — then `uploadFileComplete` finalizes the DB record
- **CloudFront signed URLs**: downloads are served via signed CloudFront URLs rather than public S3 links, so access can be revoked/expired
- **Storage accounting**: directory and file operations recalculate per-user storage usage against their plan's quota

## 🛡️ Security Features

- Password hashing with bcrypt
- HTTP header hardening via Helmet
- Rate limiting and request slow-down on all routes
- Zod-based input validation
- MongoDB ObjectId validation middleware on all `:id` route params
- Role-based access control for admin routes
- Signature verification on incoming payment webhooks

## 🚀 Deployment

This backend supports two deployment targets from the same codebase:

1. **Traditional server** (e.g. Render): `server.js` → `npm start`
2. **Serverless** (AWS Lambda + API Gateway/CloudFront): `lambda.js` wraps the Express app with `serverless-http`

Both are automated via GitHub Actions CI/CD.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

MIT

## 📞 Support

For support, open an issue in the repository.
