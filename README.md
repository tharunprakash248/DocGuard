# Cloud Document Guardian (DocGuard)

A modern, secure personal cloud document management system built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Firebase**.

Store, organize, search, and track expiration dates for your most important documents (Passports, Driving Licenses, Diplomas, Insurance Policies, Medical Records, and more).

---

## Features

- **Authentication**:
  - Secure Email & Password sign-up and sign-in via Firebase Authentication.
  - Multi-tenant data segregation: Each user has private access solely to their own documents.
  - Graceful local vault mode for quick local preview.
- **Dashboard**:
  - Metric counters: Total Documents, Valid Documents, Expiring Soon (within 30 days), Expired.
  - Upcoming Expirations widget highlighting urgent documents expiring in 30 days.
  - Recently uploaded files stream with quick actions.
- **Document Upload**:
  - Drag-and-drop or file selector supporting PDF, JPG, JPEG, and PNG.
  - Upload progress bar with feedback.
  - Stores binary files in **Firebase Storage** and metadata in **Cloud Firestore**.
  - Document name auto-detection from filename.
- **Categories**:
  - 8 core classifications: Identity, Education, Certificates, License, Insurance, Finance, Medical, and Other.
  - Category statistics and filtered browsing.
- **Instant Search**:
  - Prominent search bar filtering across document title, category, and file format simultaneously with zero delay.
- **Advanced Filtering & Sorting**:
  - Filter by Category, File Type (PDF, JPG, PNG), and Status (Valid, Expiring Soon, Expired, No Expiry).
  - Sort by Expiry Date (Soonest first), Newest, Oldest, or Alphabetical.
  - Toggle between Grid Cards view and Table List view.
- **Document Actions**:
  - **View**: Responsive in-app document preview for PDFs and Images with metadata details.
  - **Download**: Direct browser download trigger.
  - **Edit**: Edit title, category, issue date, expiry date, and notes.
  - **Delete**: Safe delete with confirmation dialog, cleaning up both Firestore metadata and Storage file.
- **Expiry Tracking**:
  - Status badges: Green (Valid), Orange (Expiring Soon - $\le$ 30 days), Red (Expired), Gray (No Expiry).
  - Human-friendly date calculations: *"Expires in 7 days"*, *"Expired 12 days ago"*, *"Expires today"*.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+) and npm installed.

### 2. Configure Firebase
Create a project on [Firebase Console](https://console.firebase.google.com):
1. Enable **Authentication** with Email/Password provider.
2. Enable **Firestore Database**.
3. Enable **Cloud Storage**.
4. Create a Web App in Firebase Project Settings and copy the configuration keys into `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...
```

### 3. Apply Security Rules
Deploy `firestore.rules` and `storage.rules` in your Firebase Console to lock down read/write access per user.

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```
