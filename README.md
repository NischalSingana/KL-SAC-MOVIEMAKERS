# 🎬 KL-SAC MOVIEMAKERS MANAGEMENT SYSTEM

A premium, high-performance web application designed for **KL SAC Movie Makers** to streamline project management, equipment inventory, and student collaborations. Built with a "Netflix-inspired" dark aesthetic, prioritizing cinematic visual excellence and seamless user experience.

---

## 🚀 Key Features

### 🛠 Equipment & Inventory Management
- **Smart Tracking**: Real-time monitoring of cameras, lenses, and production gear.
- **Quantity-Based Systems**: Manage equipment by batch and individual units.
- **Digital Registration**: Minimalist professional forms for onboarding new gear.
- **Inventory Analytics**: Immediate visibility into stock levels and current availability.

### 📋 Borrowing System (Logistics)
- **Multi-Select Borrowing**: Assign multiple pieces of equipment to a student in a single log.
- **Quantity Control**: Select specific unit counts for high-volume items (e.g., lights, batteries).
- **Validation Engine**: Prevents over-borrowing and double-booking with real-time stock checks.
- **History & Tracking**: Categorized logs with IST-localized timestamps for precise return monitoring.

### 🎥 Project Pipeline
- **Tiered Project Types**: Specialized workflows for **Short Films**, **Documentaries**, and **Cover Songs**.
- **Team Management**: Link students to specific projects with assigned roles and contacts.
- **Cloud Documentation**: Integrated permission letter uploads with secure storage.
- **Timeline Strategy**: Track project durations from inception to final completion.

### 📊 Executive Dashboard
- **Real-Time Overview**: Quick stats on active projects, equipment status, and recent borrows.
- **Visual Analytics**: Interactive data visualization using Recharts for inventory health.
- **Notification Center**: Instant visibility into student registrations and pending actions.

### 🔐 Advanced Authentication
- **Secure Sessions**: Robust Auth implementation using NextAuth.js.
- **Role-Based Access**: Granular control over administrative and student-level actions.

---

## 💻 Tech Stack

### Frontend & Core
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router Architecture)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type-safe development
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & Vanilla CSS for premium aesthetics
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth cinematic transitions
- **Icons**: [Lucide React](https://lucide.dev/) for professional visual language
- **Components**: [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/) primitives

### Backend & Infrastructure
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Powered by [Neon Serverless](https://neon.tech/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js v5](https://authjs.dev/)
- **Storage**: [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) (Compatible with Cloudflare R2)
- **Visualization**: [Recharts](https://recharts.org/) & [Three.js](https://threejs.org/)

---

## 🛠 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NischalSingana/KL-SAC-MOVIEMAKERS.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file with the following variables:
   ```env
   DATABASE_URL=
   AUTH_SECRET=
   R2_ACCESS_KEY=
   R2_SECRET_KEY=
   R2_ENDPOINT=
   ```

4. **Initialize Database**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 🎨 Design Philosophy

The project follows a **Cinematic Dark Theme** philosophy:
- **Visual Hierarchy**: Netflix-red accents (`#E50914`) on deep charcoal backdrops.
- **Glassmorphism**: Subtle blurs and translucent layers for depth.
- **Micro-interactions**: Responsive hover states and state-aware gradients.
- **Professionalism**: Industry-standard typography (Inter/Geist) and spacing.

---

**Developed for KL SAC Movie Makers by [Nischal Singana](https://github.com/NischalSingana)**
