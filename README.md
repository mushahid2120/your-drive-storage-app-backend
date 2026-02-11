<img src="your-drive.svg" align="left" width="48" hspace="10" alt="App Icon">

# Your Drive 

<h2 style="color:#0b74de">📘 Introduction</h2>
A secure, session-based storage backend that supports direct-to-S3 uploads, CloudFront signed downloads, OTP email signup, and admin operations.

<h2 style="color:#0b74de">🚀 Live Demos</h2>
<a href="https://mushahidjs.dpdns.org">
  <h2 style="display: inline;">Live Demo  🚀</h2>
</a>
 — deployed via Netlify (frontend) and Render (backend).

<br/>

<a href="https://cf.mushahidjs.dpdns.org">
  <h2 style="display: inline;">Live Demo  🚀</h2>
</a> — frontend served from S3 + CloudFront; backend deployed as Lambda (serverless) behind API gateway/CloudFront.



<h2 style="color:#0b74de">📁 Full repository tree (backend)</h2>

```
your-drive-storage-app-backend/
├─ app.js
├─ server.js
├─ lambda.js
├─ package.json
├─ README.md
├─ .env (not committed)
├─ config/
│  ├─ env.js
	│  ├─ db.js
	│  ├─ dbSetup.js
	│  └─ redis.js
├─ Controller/
│  ├─ userController.js
	│  ├─ fileController.js
	│  ├─ dirController.js
	│  └─ otpController.js
├─ Model/
│  ├─ userModel.js
	│  ├─ fileModel.js
	│  ├─ dirModel.js
	│  ├─ otpModel.js
	│  └─ sessionModel.js
├─ routes/
│  ├─ userRoutes.js
	│  ├─ fileRoutes.js
	│  ├─ dirRoutes.js
	│  └─ otpRoutes.js
├─ service/
│  ├─ aws_s3.js
	│  ├─ aws_cf.js
	│  └─ sendOtp.js
├─ middleware/
│  ├─ authCheckMW.js
	│  └─ validateIdMW.js
└─ validator/
	 └─ authSchemaZod.js
```

<h2 style="color:#0b74de">✨ Features (high level)</h2>


- Authentication: secure user signup (email OTP), password-based login, and social login (Google). Sessions are cookie-backed and server-managed for easy invalidation.
- File storage: direct-to-cloud uploads with server-side verification and CDN-backed secure downloads; per-user storage quota and safe file lifecycle (upload, finalize, rename, delete).
- Directory management: nested folders, rename, and recursive delete with storage accounting.
- Admin tools: user management (view users, session control, soft/hard delete) and operational safeguards.
- Validation & security: input validation, HTTP hardening, rate-limiting, and ownership checks to prevent unauthorized actions.
- Scalability & deployment: supports both managed server deployment (Render) and serverless deployment (Lambda) with CI/CD automation via GitHub Actions.

<h2 style="color:#0b74de">🏗 Architecture & data models</h2>

- MVC organization: code follows a clear Model–View–Controller separation (controllers for request handling, models for data, services for external integrations).
- Mongoose schemas: application-level schemas implemented via Mongoose ensure consistent validation and document shape.
- MongoDB server schema considerations: data modeling was designed with document relationships and indexing in mind to support listing, hierarchical paths, and quota calculations.

<h2 style="color:#0b74de">🛡️ Security-first posture</h2>
- The README intentionally omits low-level API paths and implementation specifics to reduce exposure. Reviewers can evaluate security choices by inspecting controllers and model code.
- Production secrets are kept out of source control and expected to be managed by the deployment platform's secret store or a secret manager.
