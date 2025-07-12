# WearShare – Community Clothing Exchange

A full-stack web application that enables users to swap or redeem clothing items via a point-based system to encourage sustainable fashion.

## 🚀 Features

### 🔐 User Authentication
- Email/password-based sign up and login
- Auth state management using Supabase Auth
- Protected routes and admin access control

### 🏠 Landing Page
- Attractive hero section with call-to-action buttons
- Featured items carousel from Supabase storage
- Platform introduction and benefits

### 👤 User Dashboard
- User profile details (name, email, profile image)
- Points balance display
- List of user's uploaded items
- Ongoing swaps and completed swap history
- Tabbed interface for easy navigation

### 🧥 Item Management
- **Add New Items**: Upload images to Supabase Storage, enter item details
- **Browse Items**: Search, filter by category/type, pagination, grid/list views
- **Item Details**: Image gallery, full description, swap/redemption options
- **Item Status**: Pending (awaiting approval), available, swapped, redeemed states

### 🧑‍💼 Admin Panel
- Admin-only access with role-based permissions
- Item moderation (approve/reject/delete)
- User management and admin role assignment
- Platform statistics dashboard

### 💡 Extra Features
- Tag-based item search and filtering
- Responsive and mobile-friendly UI using Tailwind CSS
- Real-time notifications with toast messages
- Image upload with preview and management
- Point-based redemption system

## 🛠️ Tech Stack

- **Frontend**: React 19 with Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Functions)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📊 Database Schema

### Users Table
```sql
users (
  id: uuid (primary key)
  name: text
  email: text
  avatar_url: text
  points: integer (default: 100)
  isAdmin: boolean (default: false)
  created_at: timestamp
)
```

### Items Table
```sql
items (
  id: uuid (primary key)
  title: text
  description: text
  category: text
  type: text
  size: text
  condition: text
  tags: text[]
  status: text (pending, available, swapped, redeemed)
  images: text[]
  uploader_id: uuid (foreign key to users.id)
  approved: boolean (default: false)
  created_at: timestamp
)
```

### Swaps Table
```sql
swaps (
  id: uuid (primary key)
  item_id: uuid (foreign key to items.id)
  requester_id: uuid (foreign key to users.id)
  owner_id: uuid (foreign key to users.id)
  status: text (pending, accepted, declined, completed)
  created_at: timestamp
)
```

### Redemptions Table
```sql
redemptions (
  id: uuid (primary key)
  item_id: uuid (foreign key to items.id)
  redeemer_id: uuid (foreign key to users.id)
  points_used: integer
  status: text (pending, completed)
  created_at: timestamp
)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wearshare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Go to Settings > API to get your project URL and anon key
   - Create the database tables using the schema above
   - Set up storage buckets for `item-images` and `user-avatars`

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js       # Navigation bar
│   ├── ProtectedRoute.js # Route protection
│   └── AdminRoute.js   # Admin route protection
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── lib/               # Utility libraries
│   └── supabase.js    # Supabase client configuration
├── pages/             # Page components
│   ├── LandingPage.js # Home page
│   ├── LoginPage.js   # Login form
│   ├── SignUpPage.js  # Registration form
│   ├── Dashboard.js   # User dashboard
│   ├── AddItem.js     # Add new item form
│   ├── BrowseItems.js # Item browsing
│   ├── ItemDetail.js  # Item details page
│   └── AdminPanel.js  # Admin panel
└── App.js             # Main app component
```

## 🔧 Configuration

### Supabase Setup

1. **Enable Authentication**
   - Go to Authentication > Settings
   - Enable email confirmations (optional)
   - Configure email templates

2. **Create Storage Buckets**
   ```sql
   -- Create storage buckets
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('item-images', 'item-images', true),
   ('user-avatars', 'user-avatars', true);
   ```

3. **Set up Row Level Security (RLS)**
   ```sql
   -- Enable RLS on tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE items ENABLE ROW LEVEL SECURITY;
   ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;
   ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
   ```

4. **Create Policies**
   ```sql
   -- Users can read their own profile
   CREATE POLICY "Users can view own profile" ON users
   FOR SELECT USING (auth.uid() = id);

   -- Users can update their own profile
   CREATE POLICY "Users can update own profile" ON users
   FOR UPDATE USING (auth.uid() = id);

   -- Anyone can view approved items
   CREATE POLICY "Anyone can view approved items" ON items
   FOR SELECT USING (approved = true);

   -- Users can create items
   CREATE POLICY "Users can create items" ON items
   FOR INSERT WITH CHECK (auth.uid() = uploader_id);

   -- Users can update their own items
   CREATE POLICY "Users can update own items" ON items
   FOR UPDATE USING (auth.uid() = uploader_id);

   -- Users can delete their own items
   CREATE POLICY "Users can delete own items" ON items
   FOR DELETE USING (auth.uid() = uploader_id);

   -- Admins can do everything
   CREATE POLICY "Admins can do everything" ON items
   FOR ALL USING (
     EXISTS (
       SELECT 1 FROM users 
       WHERE users.id = auth.uid() 
       AND users.isAdmin = true
     )
   );
   ```

## 🎨 Customization

### Styling
The application uses Tailwind CSS with custom color schemes. You can modify the colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your primary color palette
      },
      secondary: {
        // Your secondary color palette
      }
    }
  }
}
```

### Point System
The point system can be customized in the following files:
- `src/pages/ItemDetail.js` - Points needed for redemption
- `src/contexts/AuthContext.js` - Starting points for new users

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard

### Deploy to Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Supabase for the amazing backend-as-a-service
- Tailwind CSS for the utility-first CSS framework
- Lucide React for the beautiful icons
- React community for the excellent ecosystem