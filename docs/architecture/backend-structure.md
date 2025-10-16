# Backend Repository Structure

```
ibeanthere-be/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Backend CI/CD
│   │   └── deploy.yml          # Render deployment
│   └── pull_request_template.md
├── .cursor/
│   └── rules/                   # Backend-specific Cursor rules
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── cafes.py         # Café management
│   │   │   ├── reviews.py       # Review CRUD
│   │   │   └── users.py         # User management
│   │   └── dependencies.py      # API dependencies
│   ├── models/
│   │   ├── __init__.py
│   │   ├── cafe.py              # Café Pydantic models
│   │   ├── review.py            # Review Pydantic models
│   │   ├── user.py              # User Pydantic models
│   │   └── base.py              # Base model classes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py      # Authentication logic
│   │   ├── cafe_service.py      # Café business logic
│   │   ├── review_service.py    # Review business logic
│   │   └── user_service.py      # User management logic
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py        # Supabase connection
│   │   ├── queries/
│   │   │   ├── __init__.py
│   │   │   ├── cafe_queries.py
│   │   │   ├── review_queries.py
│   │   │   └── user_queries.py
│   │   └── migrations/          # Database migrations
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── auth.py              # JWT utilities
│   │   ├── validators.py        # Custom validators
│   │   └── exceptions.py        # Custom exceptions
│   └── middleware/
│       ├── __init__.py
│       ├── cors.py              # CORS configuration
│       └── auth.py              # Authentication middleware
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Test configuration
│   ├── api/
│   │   ├── test_auth.py
│   │   ├── test_cafes.py
│   │   └── test_reviews.py
│   ├── services/
│   │   ├── test_auth_service.py
│   │   └── test_review_service.py
│   └── utils/
│       └── test_validators.py
├── docs/
│   ├── README.md
│   ├── API.md                   # API documentation
│   ├── DEPLOYMENT.md
│   └── DATABASE.md
├── scripts/
│   ├── init_db.py               # Database initialization
│   └── seed_data.py             # Sample data seeding
├── requirements/
│   ├── base.txt                 # Base dependencies
│   ├── dev.txt                  # Development dependencies
│   └── prod.txt                 # Production dependencies
├── requirements.txt
├── pyproject.toml
├── .env.example
├── .gitignore
└── render.yaml
```

## Key Features:
- **Clean Architecture** with clear separation of concerns
- **API versioning** (v1, v2, etc.)
- **Service layer** for business logic
- **Database abstraction** with query modules
- **Comprehensive testing** with pytest
- **CI/CD pipeline** for Render deployment
- **Environment-based** dependency management
