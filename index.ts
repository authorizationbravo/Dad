
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Sample legislative data
const bills = [
  {
    id: 1,
    title: "Climate Action and Investment Act",
    billNumber: "HR-2024-001",
    status: "Under Review",
    summary: "Comprehensive legislation addressing climate change through clean energy investments and carbon reduction targets.",
    aiInterpretation: "This bill focuses on transitioning to renewable energy sources while creating economic incentives for green technology adoption. Key provisions include tax credits for solar installations and stricter emissions standards for industrial facilities.",
    tags: ["environment", "energy", "economy"],
    dateIntroduced: "2024-01-15",
    sponsor: "Rep. Sarah Johnson"
  },
  {
    id: 2,
    title: "Digital Privacy Protection Act",
    billNumber: "S-2024-042",
    status: "Passed Senate",
    summary: "Establishes comprehensive data protection requirements for tech companies and enhances user privacy rights.",
    aiInterpretation: "This legislation creates a framework similar to GDPR, requiring explicit consent for data collection and giving users the right to delete their personal information. Companies face significant penalties for data breaches.",
    tags: ["privacy", "technology", "consumer protection"],
    dateIntroduced: "2024-02-03",
    sponsor: "Sen. Michael Chen"
  },
  {
    id: 3,
    title: "Healthcare Accessibility Enhancement Act",
    billNumber: "HR-2024-078",
    status: "In Committee",
    summary: "Expands healthcare coverage and reduces prescription drug costs through Medicare negotiation powers.",
    aiInterpretation: "The bill allows Medicare to negotiate drug prices directly with pharmaceutical companies, potentially reducing costs by 20-40%. It also expands telehealth services and increases funding for rural healthcare facilities.",
    tags: ["healthcare", "medicare", "prescription drugs"],
    dateIntroduced: "2024-03-12",
    sponsor: "Rep. Maria Rodriguez"
  }
];

// API Routes
app.get('/api/bills', (req, res) => {
  const { search, tag } = req.query;
  let filteredBills = bills;

  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredBills = filteredBills.filter(bill => 
      bill.title.toLowerCase().includes(searchTerm) ||
      bill.summary.toLowerCase().includes(searchTerm) ||
      bill.aiInterpretation.toLowerCase().includes(searchTerm)
    );
  }

  if (tag) {
    filteredBills = filteredBills.filter(bill => 
      bill.tags.includes(tag.toString().toLowerCase())
    );
  }

  res.json(filteredBills);
});

app.get('/api/bills/:id', (req, res) => {
  const bill = bills.find(b => b.id === parseInt(req.params.id));
  if (!bill) {
    return res.status(404).json({ error: 'Bill not found' });
  }
  res.json(bill);
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Legislative Knowledge Base running at http://0.0.0.0:${port}`);
});
