Create a production-ready full-stack Inventory Management and Billing System using Next.js 15 App Router, TypeScript, MongoDB Atlas, Mongoose, and Tailwind CSS.

The project must follow professional software engineering principles, scalable architecture, OOP concepts, SOLID principles, and clean architecture patterns.

The application should support:
- Product management
- Sales management
- Purchase management
- Inventory tracking
- Invoice generation
- Billing system
- Weekly/monthly reports
- Product-wise reports
- Dashboard analytics

==================================================
TECH STACK
==================================================

Frontend:
- Next.js 15 App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:
- Next.js API Routes / Server Actions
- MongoDB Atlas
- Mongoose ODM

Additional Libraries:
- React Hook Form
- Zod validation
- Zustand state management
- TanStack Table
- Recharts
- NextAuth.js authentication
- Cloudinary image uploads
- jsPDF or Puppeteer for PDF generation

==================================================
ARCHITECTURE REQUIREMENTS
==================================================

The project must follow modular enterprise architecture.

Use:
- Repository Pattern
- Service Layer Pattern
- DTO Pattern
- Singleton Pattern
- Factory Pattern
- Dependency Separation
- SOLID principles
- Clean Code principles

Do NOT place business logic directly inside API routes or React components.

==================================================
FOLDER STRUCTURE
==================================================

Create scalable folder structure:

src/
├── app/
├── components/
├── modules/
├── services/
├── repositories/
├── interfaces/
├── models/
├── validators/
├── hooks/
├── lib/
├── utils/
├── store/
├── config/
├── constants/
├── middleware/
├── types/
└── providers/

==================================================
AUTHENTICATION & AUTHORIZATION
==================================================

Implement:
- Secure login system
- JWT/session authentication
- Role-based access control
- Admin role
- Staff role
- Protected routes
- Middleware authentication guards

==================================================
DATABASE MODELS
==================================================

Create professional Mongoose schemas for:

Users
Products
Categories
Sales
SaleItems
Purchases
PurchaseItems
Customers
Suppliers
Invoices
InventoryLogs

Include:
- timestamps
- indexes
- validations
- references
- enums
- proper schema relationships

==================================================
PRODUCT MANAGEMENT
==================================================

Features:
- Add/Edit/Delete products
- Product categories
- Product image uploads
- SKU generation
- Barcode support
- Purchase price
- Selling price
- Quantity management
- Product search/filter
- Pagination
- Product status

==================================================
SALES MODULE
==================================================

Features:
- POS billing system
- Create invoices
- Add multiple products in invoice
- Automatic stock deduction
- Customer management
- Tax calculations
- Payment methods
- Invoice printing
- PDF invoice generation
- Sales history
- Invoice numbering system

==================================================
PURCHASE MODULE
==================================================

Features:
- Supplier management
- Purchase invoices
- Purchase history
- Stock increment after purchase
- Purchase reports

==================================================
INVENTORY MANAGEMENT
==================================================

Features:
- Stock tracking
- Inventory logs
- Low stock alerts
- Out of stock alerts
- Inventory history
- Product movement tracking

==================================================
REPORTING SYSTEM
==================================================

Generate:
- Daily sales reports
- Weekly sales reports
- Monthly sales reports
- Product-wise sales reports
- Purchase reports
- Profit/loss reports
- Inventory reports

Features:
- Date range filtering
- Export to PDF
- Print reports
- Charts & analytics

==================================================
DASHBOARD
==================================================

Dashboard should display:
- Total revenue
- Total purchases
- Total sales
- Profit analytics
- Recent invoices
- Low stock alerts
- Sales graphs
- Monthly statistics

==================================================
UI/UX REQUIREMENTS
==================================================

Create:
- Modern responsive admin dashboard
- Sidebar navigation
- Mobile responsive layout
- Dark/light mode
- Reusable components
- Professional table UI
- Skeleton loading states
- Toast notifications
- Empty states
- Error boundaries

==================================================
VALIDATION & ERROR HANDLING
==================================================

Use:
- Zod validation
- Centralized error handling
- API response standardization
- Form validation
- Server-side validation

==================================================
PERFORMANCE OPTIMIZATION
==================================================

Implement:
- Lazy loading
- Dynamic imports
- Pagination
- Debounced search
- Image optimization
- API caching
- Optimized MongoDB queries

==================================================
IMAGE STORAGE
==================================================

Use Cloudinary free tier for:
- Product images
- Company logos
- Invoice branding

Create reusable Cloudinary upload utility.

==================================================
DEPLOYMENT
==================================================

Optimize deployment for:
- Vercel Free Tier
- MongoDB Atlas Free Tier
- Cloudinary Free Tier

Provide:
- .env.example
- Deployment guide
- Production configuration
- Security best practices

==================================================
CODE QUALITY
==================================================

Code must:
- Be production-ready
- Use TypeScript properly
- Avoid code duplication
- Use reusable abstractions
- Follow enterprise standards
- Be scalable for future microservices migration

==================================================
OUTPUT REQUIREMENTS
==================================================

Generate:
1. Complete scalable folder structure
2. Database schema design
3. Mongoose models
4. API architecture
5. Authentication system
6. Reusable UI components
7. Repository layer
8. Service layer
9. DTOs
10. Validation schemas
11. Dashboard pages
12. Invoice generation system
13. Reporting system
14. Deployment setup
15. Environment variables
16. Security implementation
17. Cloudinary integration
18. PDF invoice system

The final architecture should be clean, modular, scalable, maintainable, and enterprise-grade while still suitable for a mid-level MVP application.