#!/bin/bash

# =====================================================
# Docker Helper Script - Desafio Fullstack
# Facilitador para comandos Docker Compose
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show help
show_help() {
    echo -e "${BLUE}🐳 Docker Helper - Desafio Fullstack${NC}"
    echo ""
    echo -e "${GREEN}Comandos Disponíveis:${NC}"
    echo ""
    echo -e "  ${YELLOW}dev${NC}        Inicia ambiente de desenvolvimento"
    echo -e "  ${YELLOW}prod${NC}       Inicia ambiente de produção"
    echo -e "  ${YELLOW}build${NC}      Rebuild das imagens"
    echo -e "  ${YELLOW}stop${NC}       Para todos os containers"
    echo -e "  ${YELLOW}down${NC}       Para e remove containers"
    echo -e "  ${YELLOW}clean${NC}      Remove containers, images e volumes"
    echo -e "  ${YELLOW}logs${NC}       Mostra logs de todos os serviços"
    echo -e "  ${YELLOW}status${NC}     Status dos containers"
    echo -e "  ${YELLOW}shell-be${NC}   Acessa shell do backend"
    echo -e "  ${YELLOW}shell-fe${NC}   Acessa shell do frontend"
    echo -e "  ${YELLOW}shell-db${NC}   Acessa PostgreSQL"
    echo ""
    echo -e "${GREEN}Acessos após iniciar:${NC}"
    echo -e "  🌐 Frontend: ${BLUE}http://localhost:3001${NC}"
    echo -e "  🔌 Backend:  ${BLUE}http://localhost:3000${NC}"
    echo -e "  📊 GraphQL:  ${BLUE}http://localhost:3000/graphql${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker não está rodando. Inicie o Docker primeiro.${NC}"
        exit 1
    fi
}

case "${1:-help}" in
    "dev")
        echo -e "${BLUE}🚀 Iniciando ambiente de desenvolvimento...${NC}"
        check_docker
        docker compose up --build
        ;;
    
    "prod")
        echo -e "${BLUE}🏭 Iniciando ambiente de produção...${NC}"
        check_docker
        NODE_ENV=production docker compose up --build
        ;;
    
    "build")
        echo -e "${BLUE}🔨 Rebuilding imagens...${NC}"
        check_docker
        docker compose build --no-cache
        ;;
    
    "stop")
        echo -e "${YELLOW}⏸️  Parando containers...${NC}"
        docker compose stop
        ;;
    
    "down")
        echo -e "${YELLOW}⬇️  Parando e removendo containers...${NC}"
        docker compose down
        ;;
    
    "clean")
        echo -e "${RED}🧹 Limpando containers, imagens e volumes...${NC}"
        read -p "Tem certeza? Isso removerá TODOS os dados (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v --rmi all
            docker system prune -f
            echo -e "${GREEN}✅ Limpeza concluída${NC}"
        else
            echo -e "${BLUE}❌ Operação cancelada${NC}"
        fi
        ;;
    
    "logs")
        echo -e "${BLUE}📋 Mostrando logs...${NC}"
        docker compose logs -f
        ;;
    
    "status")
        echo -e "${BLUE}📊 Status dos containers:${NC}"
        docker compose ps
        ;;
    
    "shell-be")
        echo -e "${BLUE}🐚 Acessando shell do backend...${NC}"
        docker compose exec backend sh
        ;;
    
    "shell-fe")
        echo -e "${BLUE}🐚 Acessando shell do frontend...${NC}"
        docker compose exec frontend sh
        ;;
    
    "shell-db")
        echo -e "${BLUE}🐘 Acessando PostgreSQL...${NC}"
        docker compose exec postgres psql -U postgres -d teste_backend_db
        ;;
    
    "help"|"")
        show_help
        ;;
    
    *)
        echo -e "${RED}❌ Comando desconhecido: ${1}${NC}"
        echo -e "${BLUE}Use './docker-helper.sh help' para ver comandos disponíveis${NC}"
        exit 1
        ;;
esac 