# CHOREO Deployment Guide

Welcome to the complete deployment guide for CHOREO! Follow these steps to successfully deploy your web application.

## Getting Started

### New Deployment

#### 1. Access the Choreo Console
```bash
https://console.choreo.dev/
```
Sign in using your choreo console & create an organization.

#### 2. Create a Project
Initialize a new project within your organization.

#### 3. Create a Component
Click on **Web Application Component** to start building your app.

#### 4. Connect to Git Repository
Select **Continue with GitHub** to link your code repository.

#### 5. Select Repository & Branch
Choose your repository name and the desired branch for deployment.

#### 6. Add Component Details  
- **Display Name**  
- **Name**  
- **Description** (optional)

#### 7. Choose Build Presets  
Since this is a React app, choose the **React preset**.

#### 8. Build Configuration  
- **Build Command**:  
  ```bash
  npm install && npm run build
  ```
- **Build Path**:  
  ```
  dist
  ```
- **Node Version**:  
  ```
  20
  ```

#### 9. Create and Deploy
Initialize the creation and deployment process.

#### 10. Monitor the Build Process
Navigate to the **left side panel** → Click on **Build**

You can now see your component building in real-time!

---

### Re-Deploy  Project

#### 1. Build latest commits
Go to **Build** and build the latest commits.

#### 2. Navigate to Deploy Section
Once you are done with the build process go to the **Deploy** in the left side panel.

#### 3. Access Deployment Options
Open the **Deploy** dropdown arrow and click on the **Configure & Deploy** option.

#### 4. Configuration Setup

Mount the **public/config.js** file.

#### Add Configuration Code:
```javascript
window.configs = {
    apiUrl: "http://localhost:8081",
    apiUrlData: "http://localhost:8000",
    feedbackFormUrl: "",
    version: "rc-1..0",
    dataSources: "https://data.gov.lk/"
}
```

💡 **Pro Tip**: You can add any configuration needed for deployment, but ensure you've implemented logic to access these configs in your components.

#### **Critical Requirement**
You **MUST** import the config file in your `index.html`:

```html
<script src="./config.js"></script>
```

---

 🎉 Access Your Deployed App
After successful deployment, access deployed **Web App URL** in the deployment track.

---

## Testing Configuration (Development)

### Step-by-Step Testing:

#### 1. Create Config File
   Create `config.js` in your **public** folder

#### 2. Add Sample Configuration
   ```javascript
   window.configs = {
      apiUrl: "http://localhost:8081",
      apiUrlData: "http://localhost:8000",
      feedbackFormUrl: "",
      version: "rc-1.0.0",
      dataSources: "https://data.gov.lk/"
   }
   ```

#### 3. Config local proxy (React vite apps)

   Update `server` block in the `vite.config.js` file.

   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import path from 'path'

   export default defineConfig({
      base: '/', 
      plugins: [react()],
      resolve: {
         alias: {
            '@': path.resolve(__dirname, './src'),
         },
      },
      server: {
         proxy: {
            '/v1': {
               target: 'http://localhost:8081',
               changeOrigin: true,
               secure: false,
               rewrite: (path) => path.replace(/^\/v1/, '/v1'),
            },
         },
      },
   })
   ```

#### 4. Access Config in React Component
   ```javascript
      const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "http://localhost:8081";
      console.log(apiUrl)
   ```

#### 5. Check Console
   Verify that the configuration is working properly.

---

### Need Help?
If you encounter any issues during deployment, double-check:
- ✅ Config file is properly created
- ✅ Script tag is added to index.html
- ✅ Configuration logic is implemented correctly