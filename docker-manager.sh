#!/bin/bash
# Docker Build & Run Script for Tasker Application

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       TASKER - Docker Build & Run Manager          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Show menu
show_menu() {
    echo -e "${YELLOW}Select an option:${NC}"
    echo "  1) Start all services (build + run)"
    echo "  2) Start services (no rebuild)"
    echo "  3) Stop all services"
    echo "  4) View logs (all services)"
    echo "  5) View backend logs"
    echo "  6) View frontend logs"
    echo "  7) Rebuild services"
    echo "  8) Clean up (remove containers, volumes)"
    echo "  9) System prune (clean all Docker resources)"
    echo "  0) Exit"
    echo ""
    read -p "Enter your choice [0-9]: " choice
}

# Function to build and start services
start_with_build() {
    echo -e "${GREEN}Starting all services with rebuild...${NC}"
    docker-compose up --build
}

# Function to start services without rebuild
start_without_build() {
    echo -e "${GREEN}Starting all services...${NC}"
    docker-compose up -d
    echo -e "${GREEN}Services started in background.${NC}"
    echo "Access frontend: http://localhost:3000"
    echo "Access backend: http://localhost:5000"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker-compose down
    echo -e "${GREEN}Services stopped.${NC}"
}

# Function to view all logs
view_all_logs() {
    echo -e "${YELLOW}Viewing logs (press Ctrl+C to exit)...${NC}"
    docker-compose logs -f
}

# Function to view backend logs
view_backend_logs() {
    echo -e "${YELLOW}Viewing backend logs (press Ctrl+C to exit)...${NC}"
    docker-compose logs -f backend
}

# Function to view frontend logs
view_frontend_logs() {
    echo -e "${YELLOW}Viewing frontend logs (press Ctrl+C to exit)...${NC}"
    docker-compose logs -f frontend
}

# Function to rebuild
rebuild_services() {
    echo -e "${YELLOW}Rebuilding services...${NC}"
    docker-compose build
    echo -e "${GREEN}Services rebuilt.${NC}"
}

# Function to clean up
cleanup() {
    echo -e "${RED}Removing containers and volumes...${NC}"
    docker-compose down -v
    echo -e "${GREEN}Cleanup complete.${NC}"
}

# Function to prune system
prune_system() {
    echo -e "${RED}WARNING: This will remove dangling images, containers, and volumes.${NC}"
    read -p "Are you sure? (y/N): " confirm
    if [[ $confirm == "y" || $confirm == "Y" ]]; then
        echo -e "${YELLOW}Pruning Docker system...${NC}"
        docker system prune -a --volumes
        echo -e "${GREEN}Prune complete.${NC}"
    else
        echo "Cancelled."
    fi
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1)
            start_with_build
            ;;
        2)
            start_without_build
            ;;
        3)
            stop_services
            ;;
        4)
            view_all_logs
            ;;
        5)
            view_backend_logs
            ;;
        6)
            view_frontend_logs
            ;;
        7)
            rebuild_services
            ;;
        8)
            cleanup
            ;;
        9)
            prune_system
            ;;
        0)
            echo -e "${BLUE}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
