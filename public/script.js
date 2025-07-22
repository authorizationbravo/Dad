
class LegislativeKnowledgeBase {
    constructor() {
        this.bills = [];
        this.filteredBills = [];
        this.currentFilter = '';
        this.currentSearch = '';
        
        this.init();
    }

    async init() {
        await this.loadBills();
        this.setupEventListeners();
        this.renderBills();
    }

    async loadBills() {
        try {
            const response = await fetch('/api/bills');
            this.bills = await response.json();
            this.filteredBills = [...this.bills];
        } catch (error) {
            console.error('Error loading bills:', error);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.filterBills();
        });

        // Tag filtering
        const filterTags = document.querySelectorAll('.tag');
        filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                // Remove active class from all tags
                filterTags.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tag
                e.target.classList.add('active');
                
                this.currentFilter = e.target.dataset.tag;
                this.filterBills();
            });
        });

        // Modal functionality
        const modal = document.getElementById('billModal');
        const closeModal = document.getElementById('closeModal');
        
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
            }
        });
    }

    filterBills() {
        this.filteredBills = this.bills.filter(bill => {
            const matchesSearch = !this.currentSearch || 
                bill.title.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                bill.summary.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                bill.aiInterpretation.toLowerCase().includes(this.currentSearch.toLowerCase());

            const matchesFilter = !this.currentFilter || 
                bill.tags.includes(this.currentFilter);

            return matchesSearch && matchesFilter;
        });

        this.renderBills();
    }

    renderBills() {
        const grid = document.getElementById('billsGrid');
        
        if (this.filteredBills.length === 0) {
            grid.innerHTML = `
                <div class="loading">
                    <i class="fas fa-search"></i>
                    No bills found matching your criteria
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredBills.map(bill => `
            <div class="bill-card" onclick="app.showBillDetail(${bill.id})">
                <div class="bill-header">
                    <span class="bill-number">${bill.billNumber}</span>
                    <span class="bill-status ${this.getStatusClass(bill.status)}">${bill.status}</span>
                </div>
                <h3 class="bill-title">${bill.title}</h3>
                <p class="bill-summary">${this.truncateText(bill.summary, 120)}</p>
                <div class="bill-tags">
                    ${bill.tags.map(tag => `<span class="bill-tag">${tag}</span>`).join('')}
                </div>
                <div class="bill-meta">
                    <span>Sponsor: ${bill.sponsor}</span>
                    <span>${this.formatDate(bill.dateIntroduced)}</span>
                </div>
            </div>
        `).join('');
    }

    async showBillDetail(billId) {
        try {
            const response = await fetch(`/api/bills/${billId}`);
            const bill = await response.json();
            
            const modal = document.getElementById('billModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalBody = document.getElementById('modalBody');

            modalTitle.textContent = bill.title;
            modalBody.innerHTML = `
                <div class="detail-section">
                    <div class="bill-header">
                        <span class="bill-number">${bill.billNumber}</span>
                        <span class="bill-status ${this.getStatusClass(bill.status)}">${bill.status}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Summary</h4>
                    <p>${bill.summary}</p>
                </div>

                <div class="ai-interpretation">
                    <h4><i class="fas fa-robot"></i> AI Interpretation</h4>
                    <p>${bill.aiInterpretation}</p>
                </div>

                <div class="detail-section">
                    <h4>Details</h4>
                    <p><strong>Sponsor:</strong> ${bill.sponsor}</p>
                    <p><strong>Date Introduced:</strong> ${this.formatDate(bill.dateIntroduced)}</p>
                    <div class="bill-tags" style="margin-top: 1rem;">
                        ${bill.tags.map(tag => `<span class="bill-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;

            modal.style.display = 'block';
        } catch (error) {
            console.error('Error loading bill details:', error);
        }
    }

    getStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'under review':
                return 'status-review';
            case 'passed senate':
                return 'status-passed';
            case 'in committee':
                return 'status-committee';
            default:
                return 'status-review';
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Initialize the application
const app = new LegislativeKnowledgeBase();
