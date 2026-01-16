## OpenGINXplore

This Frontend application consumes the [GI-Service](https://github.com/LDFLK/GI-SERVICE.git) (BFF) to present structured, discoverable information about the Government of Sri Lanka in an intuitive and visual manner.

The application provides a unified interface to explore government entities, including ministries, departments and people, their hierarchical relationships, historical leadership, and published data. It is designed to make complex government structures easier to understand and navigate for the users.

### Features

- Government Structure Visualization
    - Explore the hierarchical structure of the Sri Lankan government
    - View relationships between ministries, departments, and affiliated entities
- Graph-Based Exploration
    - Interactive graph view to visually navigate government entities and their connections
    - Enables intuitive exploration of complex organizational relationships
- Data Catalog Discovery
    - Browse datasets published by the government, ministries, and departments
    - Centralized access to public data catalogs
- Historical Information
    - View historical records of ministries, departments, and key personnel
    - Track changes in government structures over time

### High Level Overview
```mermaid
     flowchart LR
         N1["Frontend (OpenGINXplore)"]
         N2["Backend for frontend (GI-Service)"]

         N1 <-. API calls .-> N2
```
### Tech Stack

- Framework: React(vite)
- Communication: REST
- Auth: None

## Installation & Setup

#### Prerequisite

- Node V20+
- Git

#### 1. Clone the Repository

```bash
git clone https://github.com/LDFLK/openginxplore.git
cd openginxplore
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configuration

Create a `config.js` file in the `public` directory
```
window.configs = {
  apiUrl: "<OPENGIN_BASE_URL>",
  apiUrlData: "<GI_SERVICE_BASE_URL>",
};
```

#### 4. Run the Application (development)

##### Using Terminal

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

### How to contribute?

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'feat: your descriptive commit message'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## Support

For support and questions:
- Create an issue in the repository
