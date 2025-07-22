
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
        this.secrets = {};
        this.isToolsSidebarOpen = false;
        
        this.init();
    }

    init() {
        this.currentFile = null;
        this.currentTab = 'editor';
        this.terminalHistory = [];
        this.terminalHistoryIndex = -1;
        
        this.renderFileTree();
        this.setupEventListeners();
        this.setupTabSystem();
        this.setupEditor();
        this.setupTerminal();
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

        // Download and Tools
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadProject());
        document.getElementById('toolsBtn').addEventListener('click', () => this.toggleToolsSidebar());
        document.getElementById('closeToolsBtn').addEventListener('click', () => this.toggleToolsSidebar());

        // Secrets
        document.getElementById('addSecretBtn').addEventListener('click', () => this.showSecretModal());
        document.getElementById('saveSecretBtn').addEventListener('click', () => this.saveSecret());
        document.getElementById('cancelSecretBtn').addEventListener('click', () => this.hideModal('secretModal'));
        document.getElementById('closeSecretModal').addEventListener('click', () => this.hideModal('secretModal'));
        document.getElementById('toggleSecretValue').addEventListener('click', () => this.togglePasswordVisibility());

        // Deployment
        document.getElementById('deployBtn').addEventListener('click', () => this.deployToReplit());

        // Editor controls
        document.getElementById('saveFileBtn').addEventListener('click', () => this.saveCurrentFile());
        document.getElementById('formatCodeBtn').addEventListener('click', () => this.formatCode());
        document.getElementById('searchBtn').addEventListener('click', () => this.showSearch());

        // Terminal
        document.getElementById('terminalInput').addEventListener('keydown', (e) => this.handleTerminalInput(e));
        document.getElementById('newTerminalBtn').addEventListener('click', () => this.newTerminal());

        // Git commands
        document.getElementById('commitBtn').addEventListener('click', () => this.commitChanges());
        document.getElementById('pushBtn').addEventListener('click', () => this.pushChanges());
        document.getElementById('pullBtn').addEventListener('click', () => this.pullChanges());

        // Code editor shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentFile();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.showSearch();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.showNewFileModal();
                        break;
                }
            }
        });

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

    downloadProject() {
        this.addConsoleMessage('Preparing project download...', 'info');
        
        // Create a zip-like structure for download
        const projectData = {
            'package.json': this.fileSystem['package.json'].content,
            'README.md': this.fileSystem['README.md'].content,
            'src/main.js': this.fileSystem.src.children['main.js'].content,
            'src/components/BillCard.js': this.fileSystem.src.children.components.children['BillCard.js'].content,
            'src/components/SearchBar.js': this.fileSystem.src.children.components.children['SearchBar.js'].content,
            'src/utils/api.js': this.fileSystem.src.children.utils.children['api.js'].content,
            'src/utils/helpers.js': this.fileSystem.src.children.utils.children['helpers.js'].content,
            'public/index.html': this.fileSystem.public.children['index.html'].content,
            'public/styles.css': this.fileSystem.public.children['styles.css'].content
        };

        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'legis-ai-project.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.addConsoleMessage('Project downloaded successfully', 'info');
        this.addChatMessage('Your project has been downloaded as a JSON file. You can import this into other development environments.', 'assistant');
    }

    toggleToolsSidebar() {
        const sidebar = document.getElementById('toolsSidebar');
        this.isToolsSidebarOpen = !this.isToolsSidebarOpen;
        
        if (this.isToolsSidebarOpen) {
            sidebar.classList.add('show');
            this.checkIntegrationStatus();
        } else {
            sidebar.classList.remove('show');
        }
    }

    toggleToolSection(sectionName) {
        const section = document.querySelector(`#${sectionName}-content`).parentElement;
        section.classList.toggle('expanded');
    }

    showSecretModal() {
        document.getElementById('secretModalTitle').textContent = 'Add Secret';
        document.getElementById('secretKey').value = '';
        document.getElementById('secretValue').value = '';
        document.getElementById('secretModal').classList.add('show');
        document.getElementById('secretKey').focus();
    }

    saveSecret() {
        const key = document.getElementById('secretKey').value.trim();
        const value = document.getElementById('secretValue').value.trim();
        
        if (key && value) {
            this.secrets[key] = value;
            this.renderSecretsList();
            this.hideModal('secretModal');
            this.addConsoleMessage(`Secret '${key}' saved`, 'info');
            this.checkIntegrationStatus();
        }
    }

    renderSecretsList() {
        const secretsList = document.getElementById('secretsList');
        secretsList.innerHTML = '';
        
        Object.keys(this.secrets).forEach(key => {
            const secretItem = document.createElement('div');
            secretItem.className = 'secret-item';
            secretItem.innerHTML = `
                <span class="secret-key">${key}</span>
                <div class="secret-actions">
                    <button class="btn-icon" onclick="ideApp.editSecret('${key}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="ideApp.deleteSecret('${key}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            secretsList.appendChild(secretItem);
        });
    }

    editSecret(key) {
        document.getElementById('secretModalTitle').textContent = 'Edit Secret';
        document.getElementById('secretKey').value = key;
        document.getElementById('secretValue').value = this.secrets[key];
        document.getElementById('secretModal').classList.add('show');
    }

    deleteSecret(key) {
        if (confirm(`Delete secret '${key}'?`)) {
            delete this.secrets[key];
            this.renderSecretsList();
            this.addConsoleMessage(`Secret '${key}' deleted`, 'info');
            this.checkIntegrationStatus();
        }
    }

    togglePasswordVisibility() {
        const input = document.getElementById('secretValue');
        const icon = document.getElementById('toggleSecretValue').querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    checkIntegrationStatus() {
        const integrations = ['openai', 'anthropic', 'groq'];
        const keyMappings = {
            'openai': 'OPENAI_API_KEY',
            'anthropic': 'ANTHROPIC_API_KEY',
            'groq': 'GROQ_API_KEY'
        };
        
        integrations.forEach(integration => {
            const statusElement = document.getElementById(`${integration}-status`);
            const hasKey = this.secrets[keyMappings[integration]];
            
            if (hasKey) {
                statusElement.textContent = 'Connected';
                statusElement.classList.add('connected');
            } else {
                statusElement.textContent = 'Not Connected';
                statusElement.classList.remove('connected');
            }
        });
    }

    deployToReplit() {
        const statusElement = document.getElementById('deploymentStatus');
        statusElement.textContent = 'Deploying...';
        statusElement.style.color = '#ffa500';
        
        this.addConsoleMessage('Starting deployment to Replit...', 'info');
        
        setTimeout(() => {
            statusElement.textContent = 'Deployed Successfully!';
            statusElement.style.color = '#28a745';
            this.addConsoleMessage('Deployment completed successfully', 'info');
            this.addChatMessage('Your LegisAI application has been deployed! You can share it with others.', 'assistant');
            
            setTimeout(() => {
                statusElement.textContent = 'Ready to deploy';
                statusElement.style.color = '#888';
            }, 3000);
        }, 2000);
    }

    setupTabSystem() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-content`).classList.add('active');
        
        this.currentTab = tabName;
        
        if (tabName === 'terminal') {
            document.getElementById('terminalInput').focus();
        }
    }

    closeTab(tabName) {
        if (tabName !== 'assistant') { // Don't close the assistant tab
            this.switchTab('assistant');
        }
    }

    setupEditor() {
        const editor = document.getElementById('codeEditor');
        
        editor.addEventListener('input', () => {
            this.updateEditorStatus();
            this.highlightSyntax();
        });
        
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                e.target.value = e.target.value.substring(0, start) + '  ' + e.target.value.substring(end);
                e.target.selectionStart = e.target.selectionEnd = start + 2;
            }
        });
        
        editor.addEventListener('scroll', () => {
            this.updateMinimap();
        });
    }

    openFile(path) {
        // Remove active class from all file items
        document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked file
        event.target.closest('.file-item').classList.add('active');
        
        this.currentFile = path;
        this.switchTab('editor');
        
        // Load file content
        const fileContent = this.getFileContent(path);
        document.getElementById('codeEditor').value = fileContent;
        document.getElementById('editorBreadcrumb').textContent = path;
        
        // Update language based on file extension
        const ext = path.split('.').pop().toLowerCase();
        const language = this.getLanguageFromExtension(ext);
        document.getElementById('editorLanguage').textContent = language;
        
        this.updateEditorStatus();
        this.addConsoleMessage(`Opened file: ${path}`, 'info');
    }

    getFileContent(path) {
        // Navigate through file system to get content
        const parts = path.split('/');
        let current = this.fileSystem;
        
        for (const part of parts) {
            if (current[part]) {
                current = current[part];
                if (current.type === 'folder') {
                    current = current.children;
                }
            }
        }
        
        return current?.content || `// Content of ${path}\n// This would contain the actual file content in a real IDE`;
    }

    getLanguageFromExtension(ext) {
        const languageMap = {
            'js': 'JavaScript',
            'ts': 'TypeScript',
            'jsx': 'React JSX',
            'tsx': 'React TSX',
            'html': 'HTML',
            'css': 'CSS',
            'json': 'JSON',
            'md': 'Markdown',
            'py': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C'
        };
        return languageMap[ext] || 'Plain Text';
    }

    updateEditorStatus() {
        const editor = document.getElementById('codeEditor');
        const lines = editor.value.split('\n');
        const cursorPosition = editor.selectionStart;
        const textBeforeCursor = editor.value.substring(0, cursorPosition);
        const line = textBeforeCursor.split('\n').length;
        const col = textBeforeCursor.split('\n').pop().length + 1;
        
        document.getElementById('editorPosition').textContent = `Ln ${line}, Col ${col}`;
    }

    saveCurrentFile() {
        if (this.currentFile) {
            const content = document.getElementById('codeEditor').value;
            this.updateFileContent(this.currentFile, content);
            this.addConsoleMessage(`Saved: ${this.currentFile}`, 'info');
            this.addChatMessage(`File ${this.currentFile} has been saved successfully.`, 'assistant');
        } else {
            this.addConsoleMessage('No file selected to save', 'warning');
        }
    }

    updateFileContent(path, content) {
        // Update file system with new content
        const parts = path.split('/');
        let current = this.fileSystem;
        
        for (let i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]]) {
                current = current[parts[i]];
                if (current.type === 'folder') {
                    current = current.children;
                }
            }
        }
        
        const fileName = parts[parts.length - 1];
        if (current[fileName]) {
            current[fileName].content = content;
        }
    }

    formatCode() {
        if (this.currentFile) {
            this.addConsoleMessage('Formatting code...', 'info');
            // Simulate code formatting
            setTimeout(() => {
                this.addConsoleMessage('Code formatted successfully', 'info');
            }, 500);
        }
    }

    showSearch() {
        if (this.currentTab === 'editor') {
            const searchTerm = prompt('Search for:');
            if (searchTerm) {
                const editor = document.getElementById('codeEditor');
                const content = editor.value;
                const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
                
                if (index !== -1) {
                    editor.focus();
                    editor.setSelectionRange(index, index + searchTerm.length);
                    this.addConsoleMessage(`Found "${searchTerm}"`, 'info');
                } else {
                    this.addConsoleMessage(`"${searchTerm}" not found`, 'warning');
                }
            }
        }
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminalInput');
        
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeTerminalCommand(e.target.value);
                e.target.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.terminalHistoryIndex > 0) {
                    this.terminalHistoryIndex--;
                    e.target.value = this.terminalHistory[this.terminalHistoryIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.terminalHistoryIndex < this.terminalHistory.length - 1) {
                    this.terminalHistoryIndex++;
                    e.target.value = this.terminalHistory[this.terminalHistoryIndex];
                } else {
                    this.terminalHistoryIndex = this.terminalHistory.length;
                    e.target.value = '';
                }
            }
        });
    }

    executeTerminalCommand(command) {
        if (!command.trim()) return;
        
        this.terminalHistory.push(command);
        this.terminalHistoryIndex = this.terminalHistory.length;
        
        // Add command to terminal output
        this.addTerminalLine(`user@legis-ai:~$ ${command}`);
        
        // Simulate command execution
        setTimeout(() => {
            this.simulateCommandOutput(command);
        }, 100);
    }

    addTerminalLine(text, className = '') {
        const terminalOutput = document.getElementById('terminalOutput');
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.textContent = text;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    simulateCommandOutput(command) {
        const parts = command.split(' ');
        const cmd = parts[0];
        
        switch(cmd) {
            case 'ls':
                this.addTerminalLine('index.ts  package.json  public/  README.md');
                break;
            case 'pwd':
                this.addTerminalLine('/home/user/legis-ai');
                break;
            case 'npm':
                if (parts[1] === 'install') {
                    this.addTerminalLine('Installing packages...');
                    setTimeout(() => {
                        this.addTerminalLine('✓ Packages installed successfully');
                    }, 1500);
                    return;
                } else if (parts[1] === 'run') {
                    this.addTerminalLine('Running script...');
                    setTimeout(() => {
                        this.addTerminalLine('Server started on port 3000');
                    }, 1000);
                    return;
                }
                this.addTerminalLine('npm <command>');
                break;
            case 'git':
                if (parts[1] === 'status') {
                    this.addTerminalLine('On branch main');
                    this.addTerminalLine('Changes not staged for commit:');
                    this.addTerminalLine('  modified:   index.ts');
                } else if (parts[1] === 'add') {
                    this.addTerminalLine('Changes staged for commit');
                } else {
                    this.addTerminalLine('git <command>');
                }
                break;
            case 'clear':
                document.getElementById('terminalOutput').innerHTML = '';
                return;
            case 'help':
                this.addTerminalLine('Available commands: ls, pwd, npm, git, clear, help');
                break;
            default:
                this.addTerminalLine(`bash: ${cmd}: command not found`);
        }
        
        // Add prompt for next command
        this.addTerminalLine('', 'terminal-prompt-line');
    }

    newTerminal() {
        this.addTerminalLine('--- New Terminal Session ---');
        this.addConsoleMessage('New terminal session started', 'info');
    }

    commitChanges() {
        const message = document.getElementById('commitMessage').value.trim();
        if (message) {
            this.addConsoleMessage(`Committing changes: "${message}"`, 'info');
            this.addTerminalLine(`git commit -m "${message}"`);
            setTimeout(() => {
                this.addTerminalLine('✓ Changes committed successfully');
                document.getElementById('commitMessage').value = '';
            }, 500);
        } else {
            this.addConsoleMessage('Please enter a commit message', 'warning');
        }
    }

    pushChanges() {
        this.addConsoleMessage('Pushing changes to remote repository...', 'info');
        this.addTerminalLine('git push origin main');
        setTimeout(() => {
            this.addTerminalLine('✓ Changes pushed successfully');
        }, 1500);
    }

    pullChanges() {
        this.addConsoleMessage('Pulling changes from remote repository...', 'info');
        this.addTerminalLine('git pull origin main');
        setTimeout(() => {
            this.addTerminalLine('✓ Repository up to date');
        }, 1000);
    }

    highlightSyntax() {
        // Basic syntax highlighting would go here
        // In a real IDE, this would use a proper syntax highlighter
    }

    updateMinimap() {
        const editor = document.getElementById('codeEditor');
        const minimap = document.getElementById('editorMinimap');
        const content = editor.value;
        
        // Create a simplified minimap view
        const lines = content.split('\n').slice(0, 20); // Show first 20 lines
        minimap.innerHTML = lines.map(line => 
            `<div style="height: 2px; background: ${line.trim() ? 'rgba(255,255,255,0.3)' : 'transparent'}; margin: 1px 0;"></div>`
        ).join('');
    }
}

// Initialize the IDE
const ideApp = new LegislativeIDE();
