
class LegislativeIDE {
    constructor() {
        this.fileSystem = {
            'src': {
                type: 'folder',
                children: {
                    'components': {
                        type: 'folder',
                        children: {
                            'BillCard.js': { type: 'file', content: '// Bill Card Component' },
                            'SearchBar.js': { type: 'file', content: '// Search Bar Component' }
                        }
                    },
                    'utils': {
                        type: 'folder',
                        children: {
                            'api.js': { type: 'file', content: '// API utilities' },
                            'helpers.js': { type: 'file', content: '// Helper functions' }
                        }
                    },
                    'main.js': { type: 'file', content: '// Main application file' }
                }
            },
            'public': {
                type: 'folder',
                children: {
                    'index.html': { type: 'file', content: '<!DOCTYPE html>...' },
                    'styles.css': { type: 'file', content: '/* Main styles */' }
                }
            },
            'README.md': { type: 'file', content: '# Legislative Knowledge Base' },
            'package.json': { type: 'file', content: '{\n  "name": "legis-ai"\n}' }
        };

        this.chatHistory = [];
        this.isConsoleCollapsed = false;
        
        this.init();
    }

    init() {
        this.renderFileTree();
        this.setupEventListeners();
        this.updatePreview();
        this.addConsoleMessage('Server started on port 3000', 'info');
    }

    setupEventListeners() {
        // File management
        document.getElementById('newFileBtn').addEventListener('click', () => this.showNewFileModal());
        document.getElementById('newFolderBtn').addEventListener('click', () => this.showNewFolderModal());
        
        // Chat
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearChat());

        // Console
        document.getElementById('clearConsoleBtn').addEventListener('click', () => this.clearConsole());
        document.getElementById('toggleConsoleBtn').addEventListener('click', () => this.toggleConsole());

        // Preview
        document.getElementById('refreshPreviewBtn').addEventListener('click', () => this.refreshPreview());
        document.getElementById('openExternalBtn').addEventListener('click', () => this.openExternal());

        // Run button
        document.getElementById('runBtn').addEventListener('click', () => this.runProject());

        // Modal handlers
        this.setupModalHandlers();
    }

    setupModalHandlers() {
        // New File Modal
        document.getElementById('closeNewFileModal').addEventListener('click', () => this.hideModal('newFileModal'));
        document.getElementById('createFileBtn').addEventListener('click', () => this.createNewFile());
        document.getElementById('cancelFileBtn').addEventListener('click', () => this.hideModal('newFileModal'));

        // New Folder Modal
        document.getElementById('closeNewFolderModal').addEventListener('click', () => this.hideModal('newFolderModal'));
        document.getElementById('createFolderBtn').addEventListener('click', () => this.createNewFolder());
        document.getElementById('cancelFolderBtn').addEventListener('click', () => this.hideModal('newFolderModal'));

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
    }

    renderFileTree() {
        const fileTree = document.getElementById('fileTree');
        fileTree.innerHTML = this.renderFileSystemNode(this.fileSystem, '');
    }

    renderFileSystemNode(node, path) {
        let html = '';
        
        for (const [name, item] of Object.entries(node)) {
            const fullPath = path ? `${path}/${name}` : name;
            
            if (item.type === 'folder') {
                html += `
                    <div class="folder-item" onclick="ideApp.toggleFolder('${fullPath}')">
                        <i class="fas fa-chevron-right"></i>
                        <i class="fas fa-folder"></i>
                        <span>${name}</span>
                    </div>
                    <div class="folder-children" id="folder-${fullPath.replace(/[\/\s]/g, '-')}">
                        ${this.renderFileSystemNode(item.children, fullPath)}
                    </div>
                `;
            } else {
                const icon = this.getFileIcon(name);
                html += `
                    <div class="file-item" onclick="ideApp.openFile('${fullPath}')">
                        <i class="${icon}"></i>
                        <span>${name}</span>
                    </div>
                `;
            }
        }
        
        return html;
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'js': 'fab fa-js-square',
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'json': 'fas fa-file-code',
            'md': 'fab fa-markdown',
            'ts': 'fas fa-file-code',
            'jsx': 'fab fa-react',
            'tsx': 'fab fa-react'
        };
        return iconMap[ext] || 'fas fa-file';
    }

    toggleFolder(path) {
        const folderId = `folder-${path.replace(/[\/\s]/g, '-')}`;
        const folderElement = document.getElementById(folderId);
        const folderItem = folderElement.previousElementSibling;
        
        if (folderElement.style.display === 'block') {
            folderElement.style.display = 'none';
            folderItem.classList.remove('expanded');
        } else {
            folderElement.style.display = 'block';
            folderItem.classList.add('expanded');
        }
    }

    openFile(path) {
        // Remove active class from all file items
        document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked file
        event.target.closest('.file-item').classList.add('active');
        
        this.addConsoleMessage(`Opened file: ${path}`, 'info');
        
        // In a real IDE, this would open the file in an editor
        this.addChatMessage(`I see you opened ${path}. How can I help you with this file?`, 'assistant');
    }

    showNewFileModal() {
        document.getElementById('newFileModal').classList.add('show');
        document.getElementById('newFileName').focus();
    }

    showNewFolderModal() {
        document.getElementById('newFolderModal').classList.add('show');
        document.getElementById('newFolderName').focus();
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    createNewFile() {
        const fileName = document.getElementById('newFileName').value.trim();
        if (fileName) {
            // Add to file system (simplified - would need proper path handling)
            this.addConsoleMessage(`Created file: ${fileName}`, 'info');
            this.hideModal('newFileModal');
            document.getElementById('newFileName').value = '';
            
            // Re-render file tree
            this.renderFileTree();
        }
    }

    createNewFolder() {
        const folderName = document.getElementById('newFolderName').value.trim();
        if (folderName) {
            this.addConsoleMessage(`Created folder: ${folderName}`, 'info');
            this.hideModal('newFolderModal');
            document.getElementById('newFolderName').value = '';
            
            // Re-render file tree
            this.renderFileTree();
        }
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            this.addChatMessage(message, 'user');
            input.value = '';
            
            // Simulate AI response
            setTimeout(() => {
                this.generateAIResponse(message);
            }, 1000);
        }
    }

    addChatMessage(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatar}"></i>
            </div>
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        this.chatHistory.push({ sender, content, timestamp: new Date() });
    }

    async generateAIResponse(userMessage) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: 'Legislative Knowledge Base - AI-powered legal analysis tool'
                }),
            });

            const data = await response.json();
            
            if (data.error) {
                this.addChatMessage(`Error: ${data.error}`, 'assistant');
                return;
            }
            
            // Add provider indicator
            const providerBadge = data.provider !== 'none' ? ` <span class="provider-badge">${data.provider}</span>` : '';
            this.addChatMessage(data.response + providerBadge, 'assistant');
            
        } catch (error) {
            console.error('Chat error:', error);
            this.addChatMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    }

    clearChat() {
        document.getElementById('chatMessages').innerHTML = `
            <div class="message assistant-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Hello! I'm your AI assistant for legislative analysis. How can I help you today?</p>
                </div>
            </div>
        `;
        this.chatHistory = [];
    }

    addConsoleMessage(message, type = 'info') {
        const consoleOutput = document.getElementById('consoleOutput');
        const timestamp = new Date().toLocaleTimeString();
        
        const lineDiv = document.createElement('div');
        lineDiv.className = 'console-line';
        lineDiv.innerHTML = `
            <span class="console-timestamp">[${timestamp}]</span>
            <span class="console-${type}">${message}</span>
        `;
        
        consoleOutput.appendChild(lineDiv);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    clearConsole() {
        document.getElementById('consoleOutput').innerHTML = '';
    }

    toggleConsole() {
        const consolePanel = document.getElementById('consolePanel');
        const toggleBtn = document.getElementById('toggleConsoleBtn');
        const icon = toggleBtn.querySelector('i');
        
        if (this.isConsoleCollapsed) {
            consolePanel.classList.remove('collapsed');
            icon.className = 'fas fa-chevron-down';
            this.isConsoleCollapsed = false;
        } else {
            consolePanel.classList.add('collapsed');
            icon.className = 'fas fa-chevron-up';
            this.isConsoleCollapsed = true;
        }
    }

    refreshPreview() {
        const previewFrame = document.getElementById('previewFrame');
        previewFrame.src = previewFrame.src;
        this.addConsoleMessage('Preview refreshed', 'info');
    }

    openExternal() {
        window.open('/', '_blank');
        this.addConsoleMessage('Opened in new tab', 'info');
    }

    updatePreview() {
        // The iframe will automatically load the preview
        this.addConsoleMessage('Preview updated', 'info');
    }

    runProject() {
        this.addConsoleMessage('Running project...', 'info');
        this.addChatMessage('Project is now running! Check the preview panel to see your application.', 'assistant');
        
        setTimeout(() => {
            this.addConsoleMessage('Build completed successfully', 'info');
            this.refreshPreview();
        }, 2000);
    }
}

// Initialize the IDE
const ideApp = new LegislativeIDE();
