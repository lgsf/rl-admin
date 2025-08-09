#!/bin/bash

# Checkpoint management utility
# Helps view and manage checkpoints without automatic deletion

set -e

PROJECT_DIR="/Users/luizgustavoferreira/Documents/projects/portal"
CHECKPOINT_DIR="$PROJECT_DIR/.claude/brain/context/checkpoints"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[CHECKPOINT MANAGER]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    cat << EOF
Checkpoint Management Utility

Usage: $0 [command] [options]

Commands:
    list                    List all checkpoints (grouped by type)
    stats                   Show checkpoint statistics
    view <checkpoint>       View a specific checkpoint
    clean [options]         Clean old checkpoints (with confirmation)
        --keep-last <N>     Keep last N checkpoints of each type
        --older-than <days> Remove checkpoints older than N days
        --dry-run          Show what would be deleted without deleting

Examples:
    $0 list
    $0 stats
    $0 view 250804_192510_implement_dark_mode.md
    $0 clean --keep-last 50 --dry-run
    $0 clean --older-than 30

EOF
}

list_checkpoints() {
    cd "$CHECKPOINT_DIR"
    
    echo
    log "Manual Checkpoints:"
    ls -lt *_manual.md 2>/dev/null | head -20 || echo "  None found"
    
    echo
    log "Automatic Checkpoints:"
    ls -lt *_automatic.md 2>/dev/null | head -20 || echo "  None found"
    
    echo
    log "Prompt Checkpoints:"
    ls -lt *.md 2>/dev/null | grep -v "_manual\.md$" | grep -v "_automatic\.md$" | head -20 || echo "  None found"
}

show_stats() {
    cd "$CHECKPOINT_DIR"
    
    manual_count=$(ls *_manual.md 2>/dev/null | wc -l || echo 0)
    auto_count=$(ls *_automatic.md 2>/dev/null | wc -l || echo 0)
    prompt_count=$(ls *.md 2>/dev/null | grep -v "_manual\.md$" | grep -v "_automatic\.md$" | wc -l || echo 0)
    total_count=$(ls *.md 2>/dev/null | wc -l || echo 0)
    
    echo
    log "Checkpoint Statistics"
    info "Manual checkpoints:    $manual_count"
    info "Automatic checkpoints: $auto_count"
    info "Prompt checkpoints:    $prompt_count"
    info "Total checkpoints:     $total_count"
    
    if [ -d "$CHECKPOINT_DIR" ]; then
        echo
        info "Disk usage: $(du -sh "$CHECKPOINT_DIR" | cut -f1)"
        info "Oldest checkpoint: $(ls -t *.md 2>/dev/null | tail -1 || echo "None")"
        info "Newest checkpoint: $(ls -t *.md 2>/dev/null | head -1 || echo "None")"
    fi
}

view_checkpoint() {
    local checkpoint="$1"
    local file="$CHECKPOINT_DIR/$checkpoint"
    
    if [ -f "$file" ]; then
        less "$file"
    else
        error "Checkpoint not found: $checkpoint"
        exit 1
    fi
}

clean_checkpoints() {
    local keep_last=""
    local older_than=""
    local dry_run=false
    
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --keep-last)
                keep_last="$2"
                shift 2
                ;;
            --older-than)
                older_than="$2"
                shift 2
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    if [ -z "$keep_last" ] && [ -z "$older_than" ]; then
        error "Please specify --keep-last or --older-than"
        show_usage
        exit 1
    fi
    
    cd "$CHECKPOINT_DIR"
    
    if [ "$dry_run" = true ]; then
        warn "DRY RUN - No files will be deleted"
    fi
    
    # Clean by age
    if [ -n "$older_than" ]; then
        log "Finding checkpoints older than $older_than days..."
        find . -name "*.md" -mtime +$older_than -type f | while read file; do
            if [ "$dry_run" = true ]; then
                info "Would delete: $file"
            else
                rm "$file"
                info "Deleted: $file"
            fi
        done
    fi
    
    # Clean by count (keep last N of each type)
    if [ -n "$keep_last" ]; then
        log "Keeping last $keep_last checkpoints of each type..."
        
        # Manual checkpoints
        ls -t *_manual.md 2>/dev/null | tail -n +$((keep_last + 1)) | while read file; do
            if [ "$dry_run" = true ]; then
                info "Would delete manual: $file"
            else
                rm "$file"
                info "Deleted manual: $file"
            fi
        done
        
        # Automatic checkpoints
        ls -t *_automatic.md 2>/dev/null | tail -n +$((keep_last + 1)) | while read file; do
            if [ "$dry_run" = true ]; then
                info "Would delete automatic: $file"
            else
                rm "$file"
                info "Deleted automatic: $file"
            fi
        done
        
        # Prompt checkpoints
        ls -t *.md 2>/dev/null | grep -v "_manual\.md$" | grep -v "_automatic\.md$" | tail -n +$((keep_last + 1)) | while read file; do
            if [ "$dry_run" = true ]; then
                info "Would delete prompt: $file"
            else
                rm "$file"
                info "Deleted prompt: $file"
            fi
        done
    fi
    
    if [ "$dry_run" = false ]; then
        log "Cleanup complete"
        show_stats
    fi
}

# Main
case "${1:-}" in
    list)
        list_checkpoints
        ;;
    stats)
        show_stats
        ;;
    view)
        if [ -z "$2" ]; then
            error "Please specify a checkpoint to view"
            show_usage
            exit 1
        fi
        view_checkpoint "$2"
        ;;
    clean)
        shift
        clean_checkpoints "$@"
        ;;
    *)
        show_usage
        ;;
esac