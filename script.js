// ===== ESTADO GLOBAL DA APLICAÇÃO =====
class ChatApp {
    constructor() {
        this.currentAgent = {
            id: 3,
            name: 'Assistente Geral',
            avatar: 'fa-robot',
            category: null
        };
        
        this.currentChatId = 1;
        this.chats = new Map();
        this.agents = new Map();
        this.isGenerating = false;
        this.currentTheme = 'light';
        
        this.initializeApp();
        this.loadSampleData();
    }
    
    // ===== INICIALIZAÇÃO =====
    initializeApp() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupAutoResize();
        this.setupCollapsedSidebarButton();
        this.loadChatsFromStorage();
        this.loadAgentsFromStorage();
    }
    
    loadSampleData() {
        // Carregar agentes de exemplo
        this.agents.set(1, {
            id: 1,
            name: 'Especialista em Marketing',
            avatar: 'fa-bullhorn',
            category: 'marketing',
            instruction: 'Você é um especialista em marketing digital, focado em criar conteúdo envolvente e estratégias eficazes.'
        });
        
        this.agents.set(2, {
            id: 2,
            name: 'Programador Sênior',
            avatar: 'fa-code',
            category: 'desenvolvimento',
            instruction: 'Você é um programador experiente, especializado em melhores práticas de código e arquitetura de software.'
        });
        
        this.agents.set(3, {
            id: 3,
            name: 'Assistente Geral',
            avatar: 'fa-robot',
            category: null,
            instruction: 'Você é um assistente prestativo e versátil, capaz de ajudar com diversas tarefas.'
        });
        
        // Carregar chat de exemplo
        this.chats.set(1, {
            id: 1,
            title: 'Nova conversa',
            agentId: 3,
            messages: [
                {
                    id: 1,
                    type: 'ai',
                    content: 'Olá! Como posso ajudar você hoje?',
                    timestamp: new Date()
                }
            ]
        });
    }
    
    // ===== CONFIGURAÇÃO DE EVENTOS =====
    setupEventListeners() {
        // Mobile menu button
        document.getElementById('mobileMenuBtn').addEventListener('click', () => this.toggleMobileSidebar());
        
        // Mobile agents button
        document.getElementById('mobileAgentsBtn').addEventListener('click', () => this.toggleMobileAgentsDropdown());
        
        // Close mobile agents
        document.getElementById('closeMobileAgents').addEventListener('click', () => this.closeMobileAgentsDropdown());
        
        // Mobile overlay
        document.getElementById('mobileOverlay').addEventListener('click', () => {
            this.closeMobileSidebar();
            this.closeMobileAgentsDropdown();
        });
        
        // Create agent button mobile
        document.getElementById('createAgentBtnMobile').addEventListener('click', () => {
            this.closeMobileAgentsDropdown();
            this.openAgentModal();
        });
        
        // Collapse sidebars
        document.getElementById('collapseLeft').addEventListener('click', () => this.handleLeftCollapseButton());
        document.getElementById('collapseRight').addEventListener('click', () => this.toggleSidebar('right'));
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Modal de agente
        document.getElementById('createAgentBtn').addEventListener('click', () => this.openAgentModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeAgentModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeAgentModal());
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeAgentModal();
        });
        document.getElementById('saveAgentBtn').addEventListener('click', () => this.saveAgent());
        
        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectAvatar(e.currentTarget));
        });
        
        // Agent selection
        document.querySelectorAll('.agent-item').forEach(item => {
            item.addEventListener('click', (e) => this.selectAgent(e.currentTarget));
        });
        
        // Category collapse
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', (e) => this.toggleCategory(e.currentTarget));
        });
        
        // Chat input
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        // File attachment
        document.getElementById('attachFileBtn').addEventListener('click', () => this.handleFileAttachment());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Chat header for agent switch (exceto quando clicar no model selector)
        document.getElementById('chatHeader').addEventListener('click', (e) => {
            // Não abrir modal se o clique for no seletor de modelo ou em seus elementos filhos
            if (!e.target.closest('.model-selector-wrapper')) {
                this.startAgentSwitch();
            }
        });
        
        // Modal de seleção de agente
        document.getElementById('continueToAgents').addEventListener('click', () => this.showAgentSelection());
        document.getElementById('backToPhase1').addEventListener('click', () => this.backToPhase1());
        document.getElementById('agentSelectorModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeAgentSelector();
        });
        
        // Filtros do modal de agentes
        document.getElementById('agentSearch').addEventListener('input', (e) => this.filterAgents());
        document.getElementById('categoryFilter').addEventListener('change', (e) => this.filterAgents());
        
        // Model selector - novo dropdown moderno
        document.getElementById('modelSelector').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleModelDropdown();
        });
        
        // Model dropdown overlay
        document.getElementById('modelDropdownOverlay').addEventListener('click', () => {
            this.closeModelDropdown();
        });
        
        // Model options
        document.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectModel(option.dataset.model, option);
            });
        });
        
        // Model search
        document.getElementById('modelSearchInput').addEventListener('input', (e) => {
            this.filterModels(e.target.value);
        });
        
        // Refresh models button
        document.getElementById('refreshModelsBtn').addEventListener('click', () => {
            this.refreshModels();
        });
        
        // Agent switch overlay (legado)
        document.getElementById('agentSwitchOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.cancelAgentSwitch();
        });
        
        // Chat history items
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', (e) => this.loadChat(e.currentTarget));
        });
        
        // Chat actions - usar event delegation para funcionar com elementos dinâmicos
        document.getElementById('chatHistory').addEventListener('click', (e) => {
            if (e.target.closest('.chat-actions .action-btn')) {
                this.handleChatAction(e);
            }
        });
        
        // Message actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.message-actions .action-btn')) {
                this.handleMessageAction(e.target.closest('.action-btn'));
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.getElementById('modalOverlay').classList.contains('active')) {
                    this.closeAgentModal();
                }
                if (document.getElementById('agentSwitchOverlay').classList.contains('active')) {
                    this.cancelAgentSwitch();
                }
                if (document.getElementById('agentSelectorModal').classList.contains('active')) {
                    this.closeAgentSelector();
                }
                if (document.getElementById('modelDropdown').classList.contains('active')) {
                    this.closeModelDropdown();
                }
                if (document.getElementById('userDropdown').classList.contains('active')) {
                    this.closeUserDropdown();
                }
            }
        });
        
        // User profile dropdown
        document.getElementById('userInfo').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleUserDropdown();
        });
        
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
        
        // Close user dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#userProfile')) {
                this.closeUserDropdown();
            }
        });
    }
    
    // ===== FUNCIONALIDADES MOBILE =====
    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebarLeft');
        const overlay = document.getElementById('mobileOverlay');
        const isOpen = sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }
    
    openMobileSidebar() {
        const sidebar = document.getElementById('sidebarLeft');
        const overlay = document.getElementById('mobileOverlay');
        
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        
        // Prevenir scroll no body
        document.body.style.overflow = 'hidden';
    }
    
    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebarLeft');
        const overlay = document.getElementById('mobileOverlay');
        
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        
        // Restaurar scroll no body
        document.body.style.overflow = '';
    }
    
    toggleMobileAgentsDropdown() {
        const dropdown = document.getElementById('mobileAgentsDropdown');
        const isOpen = dropdown.classList.contains('active');
        
        if (isOpen) {
            this.closeMobileAgentsDropdown();
        } else {
            this.openMobileAgentsDropdown();
        }
    }
    
    openMobileAgentsDropdown() {
        const dropdown = document.getElementById('mobileAgentsDropdown');
        const overlay = document.getElementById('mobileOverlay');
        
        // Duplicar agentes da sidebar para o dropdown mobile
        this.populateMobileAgents();
        
        dropdown.classList.add('active');
        overlay.classList.add('active');
        
        // Prevenir scroll no body
        document.body.style.overflow = 'hidden';
    }
    
    closeMobileAgentsDropdown() {
        const dropdown = document.getElementById('mobileAgentsDropdown');
        const overlay = document.getElementById('mobileOverlay');
        
        dropdown.classList.remove('active');
        overlay.classList.remove('active');
        
        // Restaurar scroll no body
        document.body.style.overflow = '';
    }
    
    populateMobileAgents() {
        const mobileAgentsList = document.getElementById('agentsListMobile');
        const desktopAgentsList = document.getElementById('agentsList');
        
        // Limpar lista mobile
        mobileAgentsList.innerHTML = '';
        
        // Clonar agentes da sidebar desktop
        const agents = desktopAgentsList.cloneNode(true);
        agents.id = 'agentsListMobile';
        agents.className = 'agents-list mobile';
        
        // Adicionar event listeners para os agentes clonados
        agents.querySelectorAll('.agent-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const agentId = parseInt(item.dataset.agentId);
                const agent = this.agents.get(agentId);
                
                if (agent) {
                    this.currentAgent = agent;
                    this.updateChatHeader();
                    this.closeMobileAgentsDropdown();
                    this.showNotification(`Agente trocado para ${agent.name}`, 'info');
                    
                    // Iniciar nova conversa com o agente selecionado
                    this.createNewChat(agent);
                }
            });
        });
        
        // Adicionar event listeners para as categorias
        agents.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', (e) => {
                this.toggleCategory(header);
            });
        });
        
        mobileAgentsList.appendChild(agents);
    }
    
    // ===== FUNCIONALIDADES DE TEMA =====
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon();
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
    }
    
    updateThemeIcon() {
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // ===== FUNCIONALIDADES DE SIDEBAR =====
    handleLeftCollapseButton() {
        // Verificar se estamos em mobile
        if (window.innerWidth <= 768) {
            // Em mobile, fechar a sidebar completamente
            this.closeMobileSidebar();
        } else {
            // Em desktop, comportamento normal de recolher
            this.toggleSidebar('left');
        }
    }
    
    toggleSidebar(side) {
        const container = document.querySelector('.app-container');
        const sidebar = side === 'left' ? 
            document.getElementById('sidebarLeft') : 
            document.getElementById('sidebarRight');
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (side === 'left') {
            container.classList.toggle('left-collapsed', !isCollapsed);
        } else {
            container.classList.toggle('right-collapsed', !isCollapsed);
        }
        
        sidebar.classList.toggle('collapsed', !isCollapsed);
        
        // Atualizar ícone
        const icon = sidebar.querySelector('.collapse-btn i');
        icon.className = isCollapsed ? 
            (side === 'left' ? 'fas fa-chevron-left' : 'fas fa-chevron-right') :
            (side === 'left' ? 'fas fa-chevron-right' : 'fas fa-chevron-left');
    }
    
    // ===== FUNCIONALIDADE DO BOTÃO NOVA CONVERSA NA SIDEBAR RECOLHIDA =====
    setupCollapsedSidebarButton() {
        const leftSidebar = document.getElementById('sidebarLeft');
        
        // Adicionar event listener para clicks no botão de nova conversa
        leftSidebar.addEventListener('click', (e) => {
            // Verificar se a sidebar está recolhida e se o clique foi no botão ::after
            if (leftSidebar.classList.contains('collapsed') && 
                e.target === leftSidebar && 
                e.offsetY >= leftSidebar.offsetHeight - 60) {
                this.createNewChat();
            }
        });
    }
    
    // ===== FUNCIONALIDADES DE AGENTES =====
    openAgentModal() {
        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById('agentName').focus();
    }
    
    closeAgentModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        this.clearAgentForm();
    }
    
    clearAgentForm() {
        document.getElementById('agentName').value = '';
        document.getElementById('agentCategory').value = '';
        document.getElementById('agentInstruction').value = '';
        
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector('.avatar-option').classList.add('selected');
    }
    
    selectAvatar(avatarOption) {
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
        avatarOption.classList.add('selected');
    }
    
    saveAgent() {
        const name = document.getElementById('agentName').value.trim();
        const category = document.getElementById('agentCategory').value.trim();
        const instruction = document.getElementById('agentInstruction').value.trim();
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        
        if (!name) {
            this.showNotification('Por favor, digite o nome do agente.', 'error');
            return;
        }
        
        const newAgent = {
            id: Date.now(),
            name,
            category: category || null,
            instruction: instruction || 'Você é um assistente prestativo.',
            avatar: selectedAvatar.dataset.avatar
        };
        
        this.agents.set(newAgent.id, newAgent);
        this.addAgentToList(newAgent);
        this.saveAgentsToStorage();
        this.closeAgentModal();
        this.showNotification('Agente criado com sucesso!', 'success');
    }
    
    addAgentToList(agent) {
        const agentsList = document.getElementById('agentsList');
        
        if (agent.category) {
            // Procurar ou criar categoria
            let categoryElement = agentsList.querySelector(`[data-category="${agent.category}"]`);
            if (!categoryElement) {
                categoryElement = this.createCategoryElement(agent.category);
                agentsList.appendChild(categoryElement);
            }
            
            const categoryItems = categoryElement.nextElementSibling;
            const agentElement = this.createAgentElement(agent);
            categoryItems.appendChild(agentElement);
        } else {
            const agentElement = this.createAgentElement(agent);
            agentsList.appendChild(agentElement);
        }
    }
    
    createCategoryElement(categoryName) {
        const category = document.createElement('div');
        category.className = 'agent-category';
        category.innerHTML = `
            <div class="category-header" data-category="${categoryName}">
                <i class="fas fa-chevron-down"></i>
                <span>${categoryName}</span>
            </div>
            <div class="category-items"></div>
        `;
        
        category.querySelector('.category-header').addEventListener('click', (e) => {
            this.toggleCategory(e.currentTarget);
        });
        
        return category;
    }
    
    createAgentElement(agent) {
        const agentElement = document.createElement('div');
        agentElement.className = 'agent-item';
        agentElement.dataset.agentId = agent.id;
        agentElement.innerHTML = `
            <div class="agent-avatar">
                <i class="fas ${agent.avatar}"></i>
            </div>
            <div class="agent-info">
                <h4>${agent.name}</h4>
                <span>${agent.category || 'Assistente geral'}</span>
            </div>
        `;
        
        agentElement.addEventListener('click', () => this.selectAgent(agentElement));
        return agentElement;
    }
    
    selectAgent(agentElement) {
        const agentId = parseInt(agentElement.dataset.agentId);
        const agent = this.agents.get(agentId);
        
        if (!agent) return;
        
        if (document.getElementById('agentSwitchOverlay').classList.contains('active')) {
            // Estamos no modo de troca de agente
            this.currentAgent = agent;
            this.updateChatHeader();
            this.cancelAgentSwitch();
            this.showNotification(`Agente trocado para ${agent.name}`, 'info');
        } else {
            // Iniciar nova conversa com este agente
            this.createNewChat(agent);
        }
    }
    
    // ===== FUNCIONALIDADES DO MODAL DE SELEÇÃO DE AGENTE =====
    startAgentSwitch() {
        const modal = document.getElementById('agentSelectorModal');
        const phase1 = document.getElementById('phase1');
        const phase2 = document.getElementById('phase2');
        
        // Resetar modal
        phase1.classList.remove('hidden');
        phase2.classList.remove('active');
        
        // Mostrar modal
        modal.classList.add('active');
    }
    
    showAgentSelection() {
        const phase1 = document.getElementById('phase1');
        const phase2 = document.getElementById('phase2');
        
        // Transição para fase 2
        phase1.classList.add('hidden');
        setTimeout(() => {
            phase2.classList.add('active');
            this.populateAgentsGrid();
        }, 300);
    }
    
    backToPhase1() {
        const phase1 = document.getElementById('phase1');
        const phase2 = document.getElementById('phase2');
        
        // Transição para fase 1
        phase2.classList.remove('active');
        setTimeout(() => {
            phase1.classList.remove('hidden');
        }, 300);
    }
    
    closeAgentSelector() {
        const modal = document.getElementById('agentSelectorModal');
        const phase1 = document.getElementById('phase1');
        const phase2 = document.getElementById('phase2');
        
        modal.classList.remove('active');
        
        // Resetar estados
        setTimeout(() => {
            phase1.classList.remove('hidden');
            phase2.classList.remove('active');
        }, 300);
    }
    
    populateAgentsGrid() {
        const agentsContainer = document.getElementById('agentsListContainer');
        agentsContainer.innerHTML = '';
        
        const searchTerm = document.getElementById('agentSearch').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        // Filtrar agentes
        const filteredAgents = Array.from(this.agents.values()).filter(agent => {
            const matchesSearch = agent.name.toLowerCase().includes(searchTerm) || 
                                 (agent.category && agent.category.toLowerCase().includes(searchTerm));
            const matchesCategory = !categoryFilter || agent.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
        
        if (filteredAgents.length === 0) {
            agentsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Nenhum agente encontrado</p>
                    <small>Tente ajustar sua pesquisa ou filtros</small>
                </div>
            `;
            return;
        }
        
        // Ordenar agentes: primeiro o atual, depois por nome
        filteredAgents.sort((a, b) => {
            if (a.id === this.currentAgent.id) return -1;
            if (b.id === this.currentAgent.id) return 1;
            return a.name.localeCompare(b.name);
        });
        
        filteredAgents.forEach(agent => {
            const agentItem = document.createElement('div');
            agentItem.className = 'agent-list-item';
            agentItem.dataset.agentId = agent.id;
            
            // Marcar agente atual como selecionado
            if (agent.id === this.currentAgent.id) {
                agentItem.classList.add('selected');
            }
            
            agentItem.innerHTML = `
                <div class="agent-list-item-avatar">
                    <i class="fas ${agent.avatar}"></i>
                </div>
                <div class="agent-list-item-info">
                    <h4>${agent.name}</h4>
                    <span>${agent.category || 'Assistente geral'}</span>
                </div>
                ${agent.category ? `<div class="agent-list-item-category">${agent.category}</div>` : ''}
            `;
            
            agentItem.addEventListener('click', () => this.selectAgentFromModal(agent, agentItem));
            agentsContainer.appendChild(agentItem);
        });
    }
    
    filterAgents() {
        this.populateAgentsGrid();
    }
    
    selectAgentFromModal(agent, listItemElement) {
        // Remover seleção anterior
        document.querySelectorAll('.agent-list-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Marcar novo agente como selecionado
        listItemElement.classList.add('selected');
        
        // Atualizar agente atual
        this.currentAgent = agent;
        this.updateChatHeader();
        
        // Fechar modal com delay para mostrar a seleção
        setTimeout(() => {
            this.closeAgentSelector();
            this.showNotification(`Agente trocado para ${agent.name}`, 'info');
        }, 300);
    }
    
    // ===== FUNCIONALIDADES DO DROPDOWN DE MODELO =====
    toggleModelDropdown() {
        const dropdown = document.getElementById('modelDropdown');
        const overlay = document.getElementById('modelDropdownOverlay');
        const isOpen = dropdown.classList.contains('active');
        
        if (isOpen) {
            this.closeModelDropdown();
        } else {
            this.openModelDropdown();
        }
    }
    
    openModelDropdown() {
        const dropdown = document.getElementById('modelDropdown');
        const overlay = document.getElementById('modelDropdownOverlay');
        
        dropdown.classList.add('active');
        overlay.classList.add('active');
        
        // Focar no campo de busca
        setTimeout(() => {
            document.getElementById('modelSearchInput').focus();
        }, 100);
    }
    
    closeModelDropdown() {
        const dropdown = document.getElementById('modelDropdown');
        const overlay = document.getElementById('modelDropdownOverlay');
        
        dropdown.classList.remove('active');
        overlay.classList.remove('active');
        
        // Limpar busca
        document.getElementById('modelSearchInput').value = '';
        this.filterModels('');
    }
    
    selectModel(modelId, optionElement) {
        // Atualizar seleção visual
        document.querySelectorAll('.model-option').forEach(option => {
            option.classList.remove('selected');
        });
        optionElement.classList.add('selected');
        
        // Atualizar texto do botão
        const modelName = optionElement.querySelector('.model-option-name').textContent.trim();
        document.getElementById('selectedModelName').textContent = modelName;
        
        // Salvar preferência
        localStorage.setItem('preferredModel', modelId);
        
        // Fechar dropdown
        this.closeModelDropdown();
        
        // Mostrar notificação
        this.showNotification(`Modelo alterado para ${modelName}`, 'info');
        
        // Chamar método antigo para compatibilidade
        this.handleModelChange(modelId);
    }
    
    filterModels(searchTerm) {
        const options = document.querySelectorAll('.model-option');
        const term = searchTerm.toLowerCase();
        
        options.forEach(option => {
            const modelName = option.querySelector('.model-option-name').textContent.toLowerCase();
            const modelDescription = option.querySelector('.model-option-description').textContent.toLowerCase();
            
            const matches = modelName.includes(term) || modelDescription.includes(term);
            
            if (matches) {
                option.style.display = 'flex';
                // Adicionar animação de entrada
                option.style.animation = 'slideDown 0.3s ease forwards';
            } else {
                option.style.display = 'none';
            }
        });
        
        // Verificar se há resultados visíveis
        const visibleOptions = Array.from(options).filter(option => option.style.display !== 'none');
        const dropdownList = document.getElementById('modelDropdownList');
        
        if (visibleOptions.length === 0) {
            // Mostrar mensagem de nenhum resultado
            if (!dropdownList.querySelector('.no-results')) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>Nenhum modelo encontrado</p>
                    <small>Tente usar outros termos de busca</small>
                `;
                dropdownList.appendChild(noResults);
            }
        } else {
            // Remover mensagem de nenhum resultado se existir
            const noResults = dropdownList.querySelector('.no-results');
            if (noResults) {
                noResults.remove();
            }
        }
    }
    
    refreshModels() {
        const refreshBtn = document.getElementById('refreshModelsBtn');
        const originalContent = refreshBtn.innerHTML;
        
        // Mostrar estado de carregamento
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
        refreshBtn.disabled = true;
        
        // Simular atualização
        setTimeout(() => {
            // Restaurar botão
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
            
            // Mostrar notificação
            this.showNotification('Lista de modelos atualizada!', 'success');
            
            // Simular pequenas mudanças nos status
            this.updateModelStatuses();
        }, 1500);
    }
    
    updateModelStatuses() {
        const statusIndicators = document.querySelectorAll('.status-indicator');
        const statuses = ['online', 'slow', 'offline'];
        
        statusIndicators.forEach(indicator => {
            // Remover classes de status anteriores
            indicator.classList.remove('slow', 'offline');
            
            // Adicionar status aleatório (70% chance de estar online)
            const random = Math.random();
            if (random < 0.7) {
                // Mantém como online (classe padrão)
            } else if (random < 0.9) {
                indicator.classList.add('slow');
                const statusText = indicator.closest('.model-option-status').querySelector('span:last-child');
                if (statusText) statusText.textContent = 'Lento';
            } else {
                indicator.classList.add('offline');
                const statusText = indicator.closest('.model-option-status').querySelector('span:last-child');
                if (statusText) statusText.textContent = 'Offline';
            }
        });
    }
    
    // ===== FUNCIONALIDADE DE MUDANÇA DE MODELO (LEGADO) =====
    handleModelChange(model) {
        // Método mantido para compatibilidade com código existente
        console.log('Modelo alterado para:', model);
    }
    
    toggleCategory(header) {
        header.classList.toggle('collapsed');
        const categoryItems = header.nextElementSibling;
        categoryItems.style.display = header.classList.contains('collapsed') ? 'none' : 'block';
    }
    
    // ===== FUNCIONALIDADES DE CHAT =====
    createNewChat(agent = null) {
        const chatId = Date.now();
        const selectedAgent = agent || this.currentAgent;
        
        const newChat = {
            id: chatId,
            title: 'Nova conversa',
            agentId: selectedAgent.id,
            messages: []
        };
        
        this.chats.set(chatId, newChat);
        this.currentChatId = chatId;
        this.currentAgent = selectedAgent;
        
        this.addChatToHistory(newChat);
        this.loadChat(chatId);
        this.saveChatsToStorage();
    }
    
    addChatToHistory(chat) {
        const chatHistory = document.getElementById('chatHistory');
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-item';
        chatElement.dataset.chatId = chat.id;
        chatElement.innerHTML = `
            <div class="chat-content">
                <i class="fas fa-message"></i>
                <span class="chat-title">${chat.title}</span>
            </div>
            <div class="chat-actions">
                <button class="action-btn" title="Renomear">
                    <i class="fas fa-pencil"></i>
                </button>
                <button class="action-btn" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        chatElement.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-actions')) {
                this.loadChat(chat.id);
            }
        });
        
        chatHistory.insertBefore(chatElement, chatHistory.firstChild);
        this.updateActiveChat(chat.id);
    }
    
    loadChat(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) return;
        
        this.currentChatId = chatId;
        const agent = this.agents.get(chat.agentId);
        if (agent) {
            this.currentAgent = agent;
            this.updateChatHeader();
        }
        
        this.displayMessages(chat.messages);
        this.updateActiveChat(chatId);
    }
    
    updateActiveChat(chatId) {
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
    
    updateChatHeader() {
        document.getElementById('currentAgentName').textContent = this.currentAgent.name;
        const avatar = document.querySelector('.chat-header .agent-avatar i');
        avatar.className = `fas ${this.currentAgent.avatar}`;
    }
    
    displayMessages(messages) {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        messages.forEach(message => {
            this.addMessageToUI(message);
        });
        
        this.scrollToBottom();
    }
    
    sendMessage() {
        const input = document.getElementById('chatInput');
        const content = input.value.trim();
        
        if (!content || this.isGenerating) return;
        
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content,
            timestamp: new Date()
        };
        
        this.addMessage(userMessage);
        input.value = '';
        this.resizeTextarea();
        
        // Simular resposta da IA
        this.generateAIResponse();
    }
    
    addMessage(message) {
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            chat.messages.push(message);
            this.addMessageToUI(message);
            this.saveChatsToStorage();
            
            // Atualizar título do chat se for a primeira mensagem
            if (chat.messages.length === 1 && message.type === 'user') {
                this.suggestChatTitle(message.content);
            }
        }
    }
    
    addMessageToUI(message) {
        const container = document.getElementById('messagesContainer');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}-message`;
        
        const avatarIcon = message.type === 'user' ? 'fa-user' : this.currentAgent.avatar;
        
        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <p>${this.escapeHtml(message.content)}</p>
                ${message.type === 'ai' ? `
                    <div class="message-actions">
                        <button class="action-btn" title="Copiar">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn" title="Regererar">
                            <i class="fas fa-refresh"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    async generateAIResponse() {
        this.isGenerating = true;
        this.showLoadingIndicator();
        this.toggleSendPauseButtons();
        
        // Simular delay de resposta
        await this.delay(1500 + Math.random() * 1500);
        
        this.hideLoadingIndicator();
        
        const responses = [
            'Entendi! Posso ajudar você com isso. Deixe-me elaborar melhor...',
            'Ótima pergunta! Vou analisar isso cuidadosamente para você.',
            'Interessante! Vou considerar diferentes perspectivas sobre este assunto.',
            'Com certeza! Aqui está minha análise sobre o que você perguntou.',
            'Vou detalhar isso para você. É um ponto importante a considerar.'
        ];
        
        const aiMessage = {
            id: Date.now(),
            type: 'ai',
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date()
        };
        
        this.addMessage(aiMessage);
        this.isGenerating = false;
        this.toggleSendPauseButtons();
    }
    
    showLoadingIndicator() {
        const container = document.getElementById('messagesContainer');
        const loadingElement = document.createElement('div');
        loadingElement.className = 'message ai-message loading-message';
        loadingElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${this.currentAgent.avatar}"></i>
            </div>
            <div class="message-content">
                <div class="loading-indicator">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        `;
        
        container.appendChild(loadingElement);
        this.scrollToBottom();
    }
    
    hideLoadingIndicator() {
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }
    
    toggleSendPauseButtons() {
        const sendBtn = document.getElementById('sendBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.isGenerating) {
            sendBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
        } else {
            sendBtn.style.display = 'flex';
            pauseBtn.style.display = 'none';
        }
    }
    
    // ===== FUNCIONALIDADES DE MENSAGENS =====
    handleMessageAction(button) {
        const messageElement = button.closest('.message');
        const action = button.getAttribute('title');
        
        if (action === 'Copiar') {
            this.copyMessage(messageElement);
        } else if (action === 'Regererar') {
            this.regenerateMessage(messageElement);
        }
    }
    
    copyMessage(messageElement) {
        const content = messageElement.querySelector('p').textContent;
        navigator.clipboard.writeText(content).then(() => {
            this.showNotification('Mensagem copiada!', 'success');
        });
    }
    
    regenerateMessage(messageElement) {
        const messageIndex = Array.from(messageElement.parentNode.children).indexOf(messageElement);
        const chat = this.chats.get(this.currentChatId);
        
        if (chat && messageIndex < chat.messages.length) {
            // Remover mensagem atual e gerar nova
            chat.messages.splice(messageIndex, 1);
            messageElement.remove();
            this.generateAIResponse();
        }
    }
    
    // ===== FUNCIONALIDADES DE HISTÓRICO =====
    handleChatAction(event) {
        const action = event.target.getAttribute('title');
        const chatItem = event.target.closest('.chat-item');
        const chatId = parseInt(chatItem.dataset.chatId);
        
        if (action === 'Renomear') {
            this.openEditChatModal(chatId);
        } else if (action === 'Excluir') {
            this.openDeleteChatModal(chatId);
        }
        
        event.stopPropagation();
    }
    
    // ===== FUNCIONALIDADES DO MODAL DE EDIÇÃO =====
    openEditChatModal(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) return;
        
        this.currentEditingChatId = chatId;
        
        // Preencher o campo com o título atual
        const titleInput = document.getElementById('editChatTitle');
        titleInput.value = chat.title;
        
        // Atualizar contador de caracteres
        this.updateTitleCharCount();
        
        // Abrir modal
        const modal = document.getElementById('editChatModal');
        modal.classList.add('active');
        
        // Focar no input
        setTimeout(() => {
            titleInput.focus();
            titleInput.select();
        }, 100);
        
        // Adicionar event listeners
        this.setupEditModalListeners();
    }
    
    setupEditModalListeners() {
        // Remover listeners anteriores para evitar duplicação
        const saveBtn = document.getElementById('saveChatTitleBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const closeBtn = document.getElementById('closeEditModal');
        const titleInput = document.getElementById('editChatTitle');
        const modal = document.getElementById('editChatModal');
        
        // Clonar elementos para remover listeners antigos
        const newSaveBtn = saveBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newCloseBtn = closeBtn.cloneNode(true);
        const newTitleInput = titleInput.cloneNode(true);
        
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        titleInput.parentNode.replaceChild(newTitleInput, titleInput);
        
        // Adicionar novos listeners
        newSaveBtn.addEventListener('click', () => this.saveChatTitle());
        newCancelBtn.addEventListener('click', () => this.closeEditChatModal());
        newCloseBtn.addEventListener('click', () => this.closeEditChatModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeEditChatModal();
        });
        
        // Listener para contador de caracteres
        newTitleInput.addEventListener('input', () => this.updateTitleCharCount());
        
        // Listener para Enter
        newTitleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveChatTitle();
            } else if (e.key === 'Escape') {
                this.closeEditChatModal();
            }
        });
    }
    
    updateTitleCharCount() {
        const titleInput = document.getElementById('editChatTitle');
        const charCount = document.getElementById('titleCharCount');
        const currentLength = titleInput.value.length;
        
        charCount.textContent = currentLength;
        
        // Mudar cor se estiver perto do limite
        if (currentLength >= 45) {
            charCount.style.color = '#f44336';
        } else if (currentLength >= 40) {
            charCount.style.color = '#ff9800';
        } else {
            charCount.style.color = 'var(--text-secondary)';
        }
    }
    
    saveChatTitle() {
        const titleInput = document.getElementById('editChatTitle');
        const newTitle = titleInput.value.trim();
        
        if (!newTitle) {
            this.showNotification('Por favor, digite um nome para a conversa.', 'error');
            this.shakeModal('editChatModal');
            return;
        }
        
        const chat = this.chats.get(this.currentEditingChatId);
        if (chat) {
            chat.title = newTitle;
            
            // Atualizar na UI
            const titleElement = document.querySelector(`[data-chat-id="${this.currentEditingChatId}"] .chat-title`);
            if (titleElement) {
                titleElement.textContent = newTitle;
            }
            
            this.saveChatsToStorage();
            this.closeEditChatModal();
            this.showNotification('Conversa renomeada com sucesso!', 'success');
        }
    }
    
    closeEditChatModal() {
        const modal = document.getElementById('editChatModal');
        modal.classList.remove('active');
        this.currentEditingChatId = null;
    }
    
    // ===== FUNCIONALIDADES DO MODAL DE EXCLUSÃO =====
    openDeleteChatModal(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) return;
        
        this.currentDeletingChatId = chatId;
        
        // Preencher o título da conversa no modal
        const titleElement = document.getElementById('deleteChatTitle');
        titleElement.textContent = chat.title;
        
        // Abrir modal
        const modal = document.getElementById('deleteChatModal');
        modal.classList.add('active');
        
        // Adicionar event listeners
        this.setupDeleteModalListeners();
    }
    
    setupDeleteModalListeners() {
        // Remover listeners anteriores para evitar duplicação
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const cancelBtn = document.getElementById('cancelDeleteBtn');
        const closeBtn = document.getElementById('closeDeleteModal');
        const modal = document.getElementById('deleteChatModal');
        
        // Clonar elementos para remover listeners antigos
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newCloseBtn = closeBtn.cloneNode(true);
        
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        // Adicionar novos listeners
        newConfirmBtn.addEventListener('click', () => this.confirmDeleteChat());
        newCancelBtn.addEventListener('click', () => this.closeDeleteChatModal());
        newCloseBtn.addEventListener('click', () => this.closeDeleteChatModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeDeleteChatModal();
        });
        
        // Listener para Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeDeleteChatModal();
            }
        });
    }
    
    confirmDeleteChat() {
        const chatId = this.currentDeletingChatId;
        
        // Remover do mapa de chats
        this.chats.delete(chatId);
        
        // Remover da UI com animação
        const chatElement = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (chatElement) {
            chatElement.style.transition = 'all 0.3s ease';
            chatElement.style.opacity = '0';
            chatElement.style.transform = 'translateX(-100%)';
            
            setTimeout(() => {
                chatElement.remove();
            }, 300);
        }
        
        // Se a conversa excluída era a atual, carregar outra
        if (this.currentChatId === chatId) {
            const remainingChats = Array.from(this.chats.keys());
            if (remainingChats.length > 0) {
                setTimeout(() => {
                    this.loadChat(remainingChats[0]);
                }, 200);
            } else {
                setTimeout(() => {
                    this.createNewChat();
                }, 200);
            }
        }
        
        this.saveChatsToStorage();
        this.closeDeleteChatModal();
        this.showNotification('Conversa excluída permanentemente!', 'info');
    }
    
    closeDeleteChatModal() {
        const modal = document.getElementById('deleteChatModal');
        modal.classList.remove('active');
        this.currentDeletingChatId = null;
    }
    
    // ===== UTILITÁRIOS PARA MODAIS =====
    shakeModal(modalId) {
        const modal = document.querySelector(`#${modalId} .modal`);
        modal.classList.add('shake');
        setTimeout(() => {
            modal.classList.remove('shake');
        }, 300);
    }
    
    suggestChatTitle(firstMessage) {
        // Simular sugestão de título baseado na primeira mensagem
        const titles = [
            'Dúvida sobre tecnologia',
            'Pedido de ajuda',
            'Conversa sobre negócios',
            'Consulta geral',
            'Discussão sobre projeto'
        ];
        
        const suggestedTitle = titles[Math.floor(Math.random() * titles.length)];
        const chat = this.chats.get(this.currentChatId);
        
        if (chat) {
            chat.title = suggestedTitle;
            const chatElement = document.querySelector(`[data-chat-id="${this.currentChatId}"] .chat-title`);
            if (chatElement) {
                chatElement.textContent = suggestedTitle;
            }
            this.saveChatsToStorage();
        }
    }
    
    // ===== FUNCIONALIDADES DE ANEXO DE ARQUIVOS =====
    handleFileAttachment() {
        // Abrir o explorador de arquivos
        document.getElementById('fileInput').click();
    }
    
    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length === 0) return;
        
        const file = files[0];
        
        // Validar arquivo (opcional - pode adicionar validações de tamanho, tipo, etc.)
        if (file.size > 50 * 1024 * 1024) { // 50MB
            this.showNotification('Arquivo muito grande! O tamanho máximo é 50MB.', 'error');
            event.target.value = ''; // Limpar input
            return;
        }
        
        // Exibir feedback visual
        this.showFileAttached(file);
        
        // Adicionar informação do arquivo ao input de mensagem
        const chatInput = document.getElementById('chatInput');
        const currentText = chatInput.value.trim();
        const fileText = currentText ? `${currentText}\n\n[Arquivo anexado: ${file.name}]` : `[Arquivo anexado: ${file.name}]`;
        chatInput.value = fileText;
        
        // Ajustar tamanho do textarea
        this.resizeTextarea();
        
        // Focar no input para continuar digitando
        chatInput.focus();
        
        // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
        event.target.value = '';
        
        // Mostrar notificação
        this.showNotification(`Arquivo "${file.name}" anexado com sucesso!`, 'success');
    }
    
    showFileAttached(file) {
        // Adicionar indicador visual de arquivo anexado
        const attachBtn = document.getElementById('attachFileBtn');
        attachBtn.classList.add('file-attached');
        
        // Adicionar tooltip com informações do arquivo
        attachBtn.setAttribute('title', `Arquivo anexado: ${file.name} (${this.formatFileSize(file.size)})`);
        
        // Remover a classe após um tempo para indicar que o arquivo foi processado
        setTimeout(() => {
            attachBtn.classList.remove('file-attached');
            attachBtn.setAttribute('title', 'Anexar arquivo');
        }, 2000);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // ===== FUNCIONALIDADES DE INPUT =====
    setupAutoResize() {
        const textarea = document.getElementById('chatInput');
        textarea.addEventListener('input', () => this.resizeTextarea());
    }
    
    resizeTextarea() {
        const textarea = document.getElementById('chatInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    // ===== STORAGE =====
    saveChatsToStorage() {
        const chatsArray = Array.from(this.chats.values());
        localStorage.setItem('chats', JSON.stringify(chatsArray));
    }
    
    loadChatsFromStorage() {
        const savedChats = localStorage.getItem('chats');
        if (savedChats) {
            try {
                const chatsArray = JSON.parse(savedChats);
                chatsArray.forEach(chat => {
                    this.chats.set(chat.id, chat);
                    this.addChatToHistory(chat);
                });
            } catch (error) {
                console.error('Erro ao carregar chats:', error);
            }
        }
    }
    
    saveAgentsToStorage() {
        const agentsArray = Array.from(this.agents.values());
        localStorage.setItem('agents', JSON.stringify(agentsArray));
    }
    
    loadAgentsFromStorage() {
        const savedAgents = localStorage.getItem('agents');
        if (savedAgents) {
            try {
                const agentsArray = JSON.parse(savedAgents);
                agentsArray.forEach(agent => {
                    this.agents.set(agent.id, agent);
                });
            } catch (error) {
                console.error('Erro ao carregar agentes:', error);
            }
        }
    }
    
    // ===== FUNCIONALIDADES DO USUÁRIO =====
    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        const isOpen = dropdown.classList.contains('active');
        
        if (isOpen) {
            this.closeUserDropdown();
        } else {
            this.openUserDropdown();
        }
    }
    
    openUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.add('active');
        
        // Adicionar overlay para fechar ao clicar fora
        if (!document.querySelector('.user-dropdown-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'user-dropdown-overlay';
            overlay.addEventListener('click', () => this.closeUserDropdown());
            document.body.appendChild(overlay);
        }
        
        setTimeout(() => {
            document.querySelector('.user-dropdown-overlay')?.classList.add('active');
        }, 10);
    }
    
    closeUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        const overlay = document.querySelector('.user-dropdown-overlay');
        
        dropdown.classList.remove('active');
        overlay?.classList.remove('active');
        
        // Remover overlay após a animação
        setTimeout(() => {
            overlay?.remove();
        }, 300);
    }
    
    handleLogout() {
        // Fechar dropdown
        this.closeUserDropdown();
        
        // Mostrar confirmação
        if (confirm('Tem certeza que deseja sair?')) {
            // Limpar dados do usuário
            localStorage.removeItem('userSession');
            localStorage.removeItem('chats');
            localStorage.removeItem('agents');
            
            // Mostrar notificação
            this.showNotification('Desconectado com sucesso!', 'success');
            
            // Simular redirecionamento (em uma app real, redirecionaria para login)
            setTimeout(() => {
                // Recarregar a página para resetar tudo
                window.location.reload();
            }, 1500);
        }
    }
    
    // ===== UTILITÁRIOS =====
    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos inline para notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor: type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateY(-20px)',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});

// ===== PREVENIR ERROS =====
window.addEventListener('error', (e) => {
    console.error('Erro na aplicação:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promessa rejeitada não tratada:', e.reason);
});
