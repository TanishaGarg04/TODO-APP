class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        this.bindEvents();
        this.initTheme();
        this.registerServiceWorker();
        await this.loadTodos();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        document.getElementById('clear-completed').addEventListener('click', () => {
            this.clearCompleted();
        });

        const resetBtn = document.getElementById('reset-all');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetAll();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelEdit();
            }
        });

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Handle PWA install prompt
        const installBtn = document.getElementById('install-app');
        if (installBtn) {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.deferredPrompt = e;
                installBtn.textContent = 'Install App';
                installBtn.style.display = 'inline-flex';
                console.log('[PWA] beforeinstallprompt fired');
            });

            installBtn.addEventListener('click', async () => {
                if (!this.deferredPrompt) return;
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                this.deferredPrompt = null;
                installBtn.style.display = 'none';
                console.log('Install prompt outcome:', outcome);
            });

            // No fallback label anymore; button only shows when event fires

            // Hide install button when app is already installed
            window.addEventListener('appinstalled', () => {
                console.log('[PWA] appinstalled');
                installBtn.style.display = 'none';
            });
        }
    }

    initTheme() {
        const saved = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        const label = document.getElementById('theme-label');
        const icon = document.getElementById('theme-icon');
        if (label && icon) {
            if (saved === 'dark') { label.textContent = 'Light'; icon.className = 'fas fa-sun'; }
            else { label.textContent = 'Dark'; icon.className = 'fas fa-moon'; }
        }
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        const label = document.getElementById('theme-label');
        const icon = document.getElementById('theme-icon');
        if (label && icon) {
            if (next === 'dark') { label.textContent = 'Light'; icon.className = 'fas fa-sun'; }
            else { label.textContent = 'Dark'; icon.className = 'fas fa-moon'; }
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service worker registered');
            } catch (err) {
                console.warn('Service worker registration failed', err);
            }
        }
    }

    async addTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        
        if (text) {
            try {
                const response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text })
                });

                if (response.ok) {
                    const newTodo = await response.json();
                    this.todos.unshift(newTodo);
                    this.render();
                    this.updateStats();
                    input.value = '';
                    input.focus();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            } catch (error) {
                console.error('Error adding todo:', error);
                alert('Failed to add todo. Please try again.');
            }
        }
    }

    async toggleTodo(id) {
        try {
            const todo = this.todos.find(t => t._id === id);
            if (todo) {
                const response = await fetch(`/api/todos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ completed: !todo.completed })
                });

                if (response.ok) {
                    const updatedTodo = await response.json();
                    const index = this.todos.findIndex(t => t._id === id);
                    this.todos[index] = updatedTodo;
                    this.render();
                    this.updateStats();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            }
        } catch (error) {
            console.error('Error toggling todo:', error);
            alert('Failed to update todo. Please try again.');
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t._id === id);
        if (todo) {
            this.cancelEdit();
            
            const todoItem = document.querySelector(`[data-id="${id}"]`);
            todoItem.classList.add('editing');
            
            const editInput = todoItem.querySelector('.edit-input');
            editInput.value = todo.text;
            editInput.focus();
            editInput.select();
        }
    }

    async saveEdit(id) {
        const todo = this.todos.find(t => t._id === id);
        const editInput = document.querySelector(`[data-id="${id}"] .edit-input`);
        const newText = editInput.value.trim();
        
        if (newText && newText !== todo.text) {
            try {
                const response = await fetch(`/api/todos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: newText })
                });

                if (response.ok) {
                    const updatedTodo = await response.json();
                    const index = this.todos.findIndex(t => t._id === id);
                    this.todos[index] = updatedTodo;
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            } catch (error) {
                console.error('Error updating todo:', error);
                alert('Failed to update todo. Please try again.');
            }
        }
        
        this.cancelEdit();
        this.render();
    }

    cancelEdit() {
        const editingItem = document.querySelector('.todo-item.editing');
        if (editingItem) {
            editingItem.classList.remove('editing');
        }
    }

    async deleteTodo(id) {
        if (confirm('Are you sure you want to delete this todo?')) {
            try {
                const response = await fetch(`/api/todos/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.todos = this.todos.filter(t => t._id !== id);
                    this.render();
                    this.updateStats();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            } catch (error) {
                console.error('Error deleting todo:', error);
                alert('Failed to delete todo. Please try again.');
            }
        }
    }

    async setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        await this.loadTodos();
        this.render();
    }

    async clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount > 0 && confirm(`Are you sure you want to delete ${completedCount} completed todo(s)?`)) {
            try {
                const response = await fetch('/api/todos/completed', {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadTodos();
                    this.render();
                    this.updateStats();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            } catch (error) {
                console.error('Error clearing completed todos:', error);
                alert('Failed to clear completed todos. Please try again.');
            }
        }
    }

    async resetAll() {
        if (this.todos.length === 0) {
            alert('No todos to reset.');
            return;
        }
        if (!confirm('This will delete ALL todos. Continue?')) return;
        try {
            const response = await fetch('/api/todos', { method: 'DELETE' });
            if (response.ok) {
                this.todos = [];
                this.render();
                this.updateStats();
            } else {
                const error = await response.json();
                alert('Error: ' + error.error);
            }
        } catch (error) {
            console.error('Error resetting todos:', error);
            alert('Failed to reset todos. Please try again.');
        }
    }

    async loadTodos() {
        try {
            const filterParam = this.currentFilter !== 'all' ? `?filter=${this.currentFilter}` : '';
            const response = await fetch(`/api/todos${filterParam}`);
            
            if (response.ok) {
                this.todos = await response.json();
            } else {
                console.error('Failed to load todos');
                this.todos = [];
            }
        } catch (error) {
            console.error('Error loading todos:', error);
            this.todos = [];
        }
    }

    getFilteredTodos() {
        return this.todos;
    }

    render() {
        const todosList = document.getElementById('todos-list');
        const emptyState = document.getElementById('empty-state');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todosList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        todosList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        
        this.bindTodoEvents();
    }

    createTodoHTML(todo) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo._id}">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="todoApp.toggleTodo('${todo._id}')"></div>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}" 
                       onkeydown="if(event.key==='Enter') todoApp.saveEdit('${todo._id}'); if(event.key==='Escape') todoApp.cancelEdit();">
                <div class="todo-actions">
                    <button class="edit-btn" onclick="todoApp.editTodo('${todo._id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="todoApp.deleteTodo('${todo._id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="save-btn" onclick="todoApp.saveEdit('${todo._id}')" title="Save" style="display: none;">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="cancel-btn" onclick="todoApp.cancelEdit()" title="Cancel" style="display: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </li>
        `;
    }

    bindTodoEvents() {
        document.querySelectorAll('.todo-item').forEach(item => {
            const editBtn = item.querySelector('.edit-btn');
            const deleteBtn = item.querySelector('.delete-btn');
            const saveBtn = item.querySelector('.save-btn');
            const cancelBtn = item.querySelector('.cancel-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    item.classList.add('editing');
                    editBtn.style.display = 'none';
                    deleteBtn.style.display = 'none';
                    saveBtn.style.display = 'flex';
                    cancelBtn.style.display = 'flex';
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.cancelEdit();
                });
            }
        });
    }

    async updateStats() {
        try {
            const response = await fetch('/api/todos/stats');
            if (response.ok) {
                const stats = await response.json();
                document.getElementById('total-todos').textContent = stats.total;
                document.getElementById('completed-todos').textContent = stats.completed;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            const total = this.todos.length;
            const completed = this.todos.filter(t => t.completed).length;
            document.getElementById('total-todos').textContent = total;
            document.getElementById('completed-todos').textContent = completed;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (!this.touchStartX || !this.touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const diffX = this.touchStartX - touchEndX;
        const diffY = this.touchStartY - touchEndY;
        
        // Horizontal swipe detection
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            const todoItem = e.target.closest('.todo-item');
            if (todoItem && diffX > 0) {
                // Swipe left - show actions
                todoItem.style.transform = 'translateX(-80px)';
            } else if (todoItem && diffX < 0) {
                // Swipe right - hide actions
                todoItem.style.transform = 'translateX(0)';
            }
        }
    }

    handleTouchEnd() {
        this.touchStartX = null;
        this.touchStartY = null;
    }
}

const todoApp = new TodoApp();

document.addEventListener('touchstart', (e) => todoApp.handleTouchStart(e), { passive: true });
document.addEventListener('touchmove', (e) => todoApp.handleTouchMove(e), { passive: true });
document.addEventListener('touchend', (e) => todoApp.handleTouchEnd(e), { passive: true });

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.getElementById('todo-input').focus();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        todoApp.setFilter('all');
    }
});

window.addEventListener('online', () => {
    console.log('App is online');
    todoApp.loadTodos().then(() => {
        todoApp.render();
        todoApp.updateStats();
    });
});

window.addEventListener('offline', () => {
    console.log('App is offline');
});