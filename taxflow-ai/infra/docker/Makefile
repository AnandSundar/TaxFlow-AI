# ==========================================
# TaxFlow AI - Docker Makefile
# ==========================================
# Convenient commands for Docker operations
# Usage: make <target>
# ==========================================

# Configuration
COMPOSE_PROJECT_NAME=taxflow-ai
COMPOSE_FILES=-f docker-compose.yml
ENV_FILE=.env

# Colors
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

# Default target
.PHONY: help
help:
	@echo ""
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)  TaxFlow AI - Docker Management$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(GREEN)Usage:$(NC)"
	@echo "  make <target>    Run the specified target"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev         Start development environment"
	@echo "  make dev-bg      Start development in background"
	@echo "  make logs        View container logs"
	@echo "  make logs-f      Follow container logs"
	@echo ""
	@echo "$(GREEN)Production:$(NC)"
	@echo "  make prod        Start production environment"
	@echo "  make prod-build  Build production images"
	@echo ""
	@echo "$(GREEN)Management:$(NC)"
	@echo "  make up          Start containers"
	@echo "  make down        Stop containers"
	@echo "  make restart     Restart containers"
	@echo "  make clean       Remove containers and volumes"
	@echo ""
	@echo "$(GREEN)Utilities:$(NC)"
	@echo "  make ps          Show running containers"
	@echo "  make shell       Open shell in backend container"
	@echo "  make db-shell    Open PostgreSQL shell"
	@echo "  make build       Build all images"
	@echo "  make pull        Pull latest images"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test        Run tests in containers"
	@echo "  make lint        Run linter in containers"
	@echo ""

# ==========================================
# Development Commands
# ==========================================

.PHONY: dev
dev:
	@echo "$(GREEN)Starting TaxFlow AI in development mode...$(NC)"
	@cp -n .env.example $(ENV_FILE) 2>/dev/null || true
	docker-compose $(COMPOSE_FILES) -f docker-compose.dev.yml up

.PHONY: dev-bg
dev-bg:
	@echo "$(GREEN)Starting TaxFlow AI in development mode (background)...$(NC)"
	@cp -n .env.example $(ENV_FILE) 2>/dev/null || true
	docker-compose $(COMPOSE_FILES) -f docker-compose.dev.yml up -d
	@echo "$(GREEN)Development environment started!$(NC)"
	@echo "$(GREEN)Frontend: http://localhost:3000$(NC)"
	@echo "$(GREEN)API: http://localhost:3001$(NC)"

.PHONY: logs
logs:
	docker-compose $(COMPOSE_FILES) logs --tail=100

.PHONY: logs-f
logs-f:
	docker-compose $(COMPOSE_FILES) logs -f

# ==========================================
# Production Commands
# ==========================================

.PHONY: prod
prod:
	@echo "$(GREEN)Starting TaxFlow AI in production mode...$(NC)"
	docker-compose $(COMPOSE_FILES) -f docker-compose.prod.yml up

.PHONY: prod-build
prod-build:
	@echo "$(YELLOW)Building production images...$(NC)"
	docker-compose $(COMPOSE_FILES) -f docker-compose.prod.yml build --no-cache
	@echo "$(GREEN)Production images built successfully!$(NC)"

# ==========================================
# Management Commands
# ==========================================

.PHONY: up
up:
	@echo "$(GREEN)Starting TaxFlow AI containers...$(NC)"
	docker-compose $(COMPOSE_FILES) up -d

.PHONY: down
down:
	@echo "$(YELLOW)Stopping TaxFlow AI containers...$(NC)"
	docker-compose $(COMPOSE_FILES) down

.PHONY: restart
restart:
	@echo "$(YELLOW)Restarting TaxFlow AI containers...$(NC)"
	docker-compose $(COMPOSE_FILES) restart

.PHONY: clean
clean:
	@echo "$(YELLOW)Cleaning up TaxFlow AI (containers + volumes)...$(NC)"
	docker-compose $(COMPOSE_FILES) down -v
	@echo "$(GREEN)Cleanup complete!$(NC)"

.PHONY: ps
ps:
	docker-compose $(COMPOSE_FILES) ps

.PHONY: shell
shell:
	@echo "$(GREEN)Opening shell in backend container...$(NC)"
	docker-compose $(COMPOSE_FILES) exec backend sh

.PHONY: db-shell
db-shell:
	@echo "$(GREEN)Opening PostgreSQL shell...$(NC)"
	docker-compose $(COMPOSE_FILES) exec postgres psql -U taxflow -d taxflow

# ==========================================
# Build Commands
# ==========================================

.PHONY: build
build:
	@echo "$(YELLOW)Building TaxFlow AI images...$(NC)"
	docker-compose $(COMPOSE_FILES) build

.PHONY: pull
pull:
	@echo "$(YELLOW)Pulling latest images...$(NC)"
	docker-compose $(COMPOSE_FILES) pull

# ==========================================
# Testing Commands
# ==========================================

.PHONY: test
test:
	@echo "$(GREEN)Running tests...$(NC)"
	docker-compose $(COMPOSE_FILES) run --rm backend npm test

.PHONY: lint
lint:
	@echo "$(GREEN)Running linter...$(NC)"
	docker-compose $(COMPOSE_FILES) run --rm backend npm run lint

# ==========================================
# Database Commands
# ==========================================

.PHONY: db-migrate
db-migrate:
	@echo "$(GREEN)Running database migrations...$(NC)"
	docker-compose $(COMPOSE_FILES) run --rm backend npm run db:migrate

.PHONY: db-seed
db-seed:
	@echo "$(GREEN)Seeding database...$(NC)"
	docker-compose $(COMPOSE_FILES) run --rm backend npm run db:seed

.PHONY: db-reset
db-reset:
	@echo "$(YELLOW)Resetting database...$(NC)"
	docker-compose $(COMPOSE_FILES) run --rm backend npm run db:reset
