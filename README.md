# 🛠️ Contributing Guidelines

Thank you for your interest in contributing to this project! Please follow the steps below to set up your development environment and contribute effectively.

## 🚀 Getting Started

### 1. Fork the Repository
Instead of cloning directly, please fork the repository to your own GitHub account:
- Go to the top-right corner of this repo and click **Fork**

### 2. Clone yout Fork
```bash
git clone https://github.com/YOUR-USERNAME/REPO-NAME.git
cd REPO-NAME
```

### 3. Create a New Branch
Always create a separate branch for your work:
```bash
git checkout -b your-work-branch
```

## 💻 NEXOAN project
You should have the NEXOAN project locally running on you device.
```bash
https://github.com/LDFLK/nexoan
```
You can get instructions from the above link.

## 🔩 Setting up the Vite project

### 1. Installing depandancies [on your project root]
```bash
npm install
```

### 2. Run the project
```bash
npm run dev
```

## 🔭 Resolving CORS Error
For the development we have setup a proxy server on **package.json** file.
```bash
"proxy": "http://localhost:8081"
```
You can change the above base url to match your locally running backend's (NEXOAN) url

## 🙏 Guidelines

- Follow consistent code style
- Test your changes before submitting
- One feature/fix per pull request
- Reference related issues (if any)

---

We appreciate your contributions and look forward to collaborating with you!


