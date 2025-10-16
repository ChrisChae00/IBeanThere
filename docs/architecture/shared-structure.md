# Shared Repository Structure

```
ibeanthere-shared/
├── types/
│   ├── typescript/
│   │   ├── api.ts               # API request/response types
│   │   ├── cafe.ts              # Café data types
│   │   ├── review.ts            # Review data types
│   │   ├── user.ts              # User data types
│   │   └── index.ts             # Export all types
│   └── python/
│       ├── __init__.py
│       ├── api_models.py        # API Pydantic models
│       ├── cafe_models.py       # Café Pydantic models
│       ├── review_models.py     # Review Pydantic models
│       └── user_models.py       # User Pydantic models
├── schemas/
│   ├── database/
│   │   ├── migrations/         # Database schema migrations
│   │   ├── seeds/               # Sample data
│   │   └── schema.sql           # Complete database schema
│   └── api/
│       ├── openapi.yaml         # OpenAPI specification
│       └── postman.json         # Postman collection
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md          # System architecture
│   ├── API_CONTRACTS.md         # API contracts between services
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── DEVELOPMENT.md           # Development setup
├── scripts/
│   ├── sync-types.js            # Sync TypeScript types
│   ├── generate-api-docs.py     # Generate API documentation
│   └── validate-contracts.py   # Validate API contracts
├── .github/
│   ├── workflows/
│   │   ├── sync-types.yml       # Sync types between repos
│   │   └── validate-contracts.yml
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
└── package.json                 # For shared scripts
```

## Key Features:
- **Type Synchronization** between frontend and backend
- **API Contracts** definition and validation
- **Database Schema** management
- **Documentation** centralization
- **Automated Sync** workflows
- **Contract Testing** between services
