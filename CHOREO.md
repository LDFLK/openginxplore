# 🚀 CHOREO Deployment Guide

Welcome to the complete deployment guide for CHOREO! Follow these steps to successfully deploy your web application.

## 🎯 Getting Started

### 1. 🌐 Access the Choreo Console
```bash
https://console.choreo.dev/
```
🔑 Sign in using your **Google**, **GitHub**, or **Microsoft** account.

### 2. 🏢 Create an Organization
Set up your organization to manage your projects and components.

### 3. 📁 Create a Project
Initialize a new project within your organization.

### 4. 🧩 Create a Component
Click on **Web Application Component** to start building your app.

### 5. 🔗 Connect to Git Repository
Select **Continue with GitHub** to link your code repository.

### 6. 📂 Select Repository & Branch
Choose your repository name and the desired branch for deployment.

### 7. 🧾 Add Component Details  
- **Display Name**  
- **Name**  
- **Description** (optional)

### 8. ⚙️ Choose Build Presets  
Since this is a React app, choose the **React preset**.

### 9. 🏗️ Build Configuration  
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
  18
  ```

### 10. ✨ Create and Deploy
Initialize the creation and deployment process.

### 11. 🔨 Monitor the Build Process
Navigate to the **left side panel** → Click on **Build**

🎉 You can now see your component building in real-time!

---

## 🚀 Post-Build Deployment

### 12. 📦 Navigate to Deploy Section
Go to the **left side panel** → Click on **Deploy**

### 13. ⚙️ Access Deployment Options
Click on the **dropdown arrow** of the Deploy button

You'll see the **Configure & Deploy** option.

### 14. 🛠️ Configuration Setup

A configuration window will open from the right side for mounting **config.js** to the public folder.

#### 📝 Add Configuration Code:
```javascript
window.configs = {
    apiUrl: "{your service url from the choreo backend connection}",
    version: "{Your version}"
}
```

> 💡 **Pro Tip**: You can add any configuration needed for deployment, but ensure you've implemented logic to access these configs in your components.

#### ⚠️ **Critical Requirement**
You **MUST** import the config file in your `index.html`:

```html
<script src="./public/config.js"></script>
```

🚨 **Important**: If this script tag is missing, configurations won't work! Always check this first if you encounter errors.

---

## 🧪 Testing Configuration Locally

### Step-by-Step Testing:

1. **📁 Create Config File**
   - Create `config.js` in your **public** folder

2. **📝 Add Sample Configuration**
   ```javascript
   window.configs = {
       version: "rc-0.1.0"
   }
   ```

3. **⚛️ Access Config in React Component**
   ```javascript
   useEffect(() => {
       const version = window?.configs?.version ? window.configs.version : "v1";
       console.log(version);
   }, [])
   ```

4. **🔍 Check Console**
   Verify that the configuration is working properly.

---

### 15. 🚀 Deploy Your Application
Click deploy and wait for the process to complete.

⏳ **Please be patient**: Deployment may take several minutes depending on your internet speed and application size.

### 17. 🎉 Access Your Deployed App
After successful deployment, you'll find your **Web App URL** in the Development box.

---

## 🎊 Congratulations!

Your CHOREO application is now successfully deployed and ready to use!

---

### 📞 Need Help?
If you encounter any issues during deployment, double-check:
- ✅ Config file is properly created
- ✅ Script tag is added to index.html
- ✅ Configuration logic is implemented correctly

**Happy Deploying!** 🚀✨