# IBeanThere Project

## 🎯 Project Overview
IBeanThere is a coffee journaling web app where users can log and rate cafés they visit.

## 🏗️ Architecture
- **Frontend**: Next.js + TypeScript + TailwindCSS
- **Backend**: FastAPI + Python  
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel (Frontend) + Render (Backend)

## 📁 Repository Structure
```
IBeanThere/                    # Organization/Workspace
├── ibeanthere-fe/             # Next.js Frontend Repository
├── ibeanthere-be/             # FastAPI Backend Repository  
├── ibeanthere-shared/         # Shared Types & Documentation
├── docs/                      # Project Documentation
│   ├── architecture/          # Architecture & Structure docs
│   └── development/           # Development guides & best practices
└── .cursor/                   # AI-assisted development rules
```

## 🚀 Quick Start
1. **Read Documentation**: Start with [docs/README.md](docs/README.md)
2. **Repository Setup**: Follow [Repository Separation Guide](docs/architecture/repository-separation.md)
3. **Development**: Check [Best Practices](docs/development/best-practices.md)
4. **Start Coding**: Set up your development environment

## 📚 Documentation
- [Architecture Documentation](docs/architecture/) - System design and structure
- [Development Guides](docs/development/) - Best practices and workflows
- [Cursor Rules](.cursor/rules/) - AI-assisted development rules

## 🛠️ Development
This project uses a split-repository architecture for real-world development experience:
- Independent frontend and backend repositories
- Shared types and documentation
- Production-ready CI/CD pipelines
- Type-safe API contracts
