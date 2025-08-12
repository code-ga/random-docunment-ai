# Study.AI

Welcome to **Study.AI**, an innovative platform designed to enhance learning and collaboration through AI-powered tools. This project provides a comprehensive environment for managing workspaces, documents, and interactive chat functionalities to facilitate educational and collaborative experiences.

## Features

Study.AI comes equipped with a variety of features aimed at improving user interaction and content management for educational purposes:

- **Workspace Management**: Create and manage multiple workspaces for different projects (good for subject of each term). Each workspace can be customized and accessed by authorized users.
- **Document Handling**: Upload, view, and manage documents within your workspaces. This feature supports RAG your document
- **Interactive Chat**: Engage in real-time conversations within workspaces. The chat system supports discussions, queries, and AI-driven assistance to enhance learning.
- **User Authentication**: Secure login and user management to ensure that your data and interactions are protected.
- **Quiz**: Add quizzes to your documents for interactive learning and assessment.
## Deployment

Study.AI is designed to be deployed using Docker, which simplifies the setup process across different environments. Follow these steps to deploy the project:

### Prerequisites

- Docker and Docker Compose installed on your system.
- Basic knowledge of command-line operations.

### Setup Instructions

1. **Clone the Repository**: Start by cloning this repository to your local machine or server where Docker is installed.

   ```bash
   git clone <repository-url>
   cd study.ai
   ```

2. **Environment Configuration**: Copy the `.env.example` file to `.env` and adjust the environment variables according to your setup.

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file to set up database credentials, API keys, and other configuration settings.

3. **Docker Compose**: Use the provided `docker-compose.yaml` file to build and run the application.

   ```bash
   docker-compose up --build
   ```

   This command will build the Docker images for the frontend, backend, database, and Nginx proxy, then start the containers.

4. **Database Initialization**: The PostgreSQL database will be initialized with the schema defined in `postgres/schema.sql` upon first run. Ensure your environment variables match the database setup.

5. **Access the Application**: Once the containers are up and running, you can access the frontend application through your web browser at `http://localhost` or the specified port in your Docker Compose configuration.

### Additional Scripts

- **Setup Environment**: Use the provided scripts `setupEnv.ps1` for Windows or `setupEnv.sh` for Unix-based systems to automate environment setup if needed.

  ```bash
  ./setupEnv.sh  # For Unix-based systems
  .\setupEnv.ps1  # For Windows
  ```

## Project Structure

- **Backend**: A Node.js application using TypeScript, handling API requests for user management, workspaces, documents, chats, and quizzes.
- **Frontend**: A React application built with Vite and React Router for a dynamic user interface.
- **Database**: PostgreSQL database for persistent data storage.
- **Nginx**: Configured as a reverse proxy to handle requests and serve the frontend application.

## Contributing

Contributions to Study.AI are welcome! Please feel free to submit pull requests or open issues for bugs, feature requests, or other improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.