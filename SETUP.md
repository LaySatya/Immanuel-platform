# 🎵 Music Platform - Next.js + PrimeReact + Supabase

A complete music platform with admin dashboard and user-friendly frontend.

## ✨ Features

### Admin Dashboard (`/admin`)
- ✅ Upload songs with metadata
- ✅ Upload PDF files (lyrics, sheet music)
- ✅ Upload cover images (PNG/JPG)
- ✅ Add YouTube video URLs
- ✅ Edit and delete songs
- ✅ View download and view statistics

### User Frontend (`/songs`)
- ✅ Browse all songs with beautiful cards
- ✅ Search by title, artist, or album
- ✅ Filter by genre
- ✅ Watch embedded YouTube videos
- ✅ Download PDF files
- ✅ View song details in modal
- ✅ Responsive design

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run this SQL in the Supabase SQL Editor:

```sql
-- Create songs table
create table songs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  artist text not null,
  album text,
  genre text,
  description text,
  youtube_url text,
  pdf_url text,
  image_url text not null,
  downloads integer default 0,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table songs enable row level security;

-- Public can read
create policy "Public songs are viewable"
  on songs for select using (true);

-- Anyone can write (add auth later)
create policy "Anyone can insert" on songs for insert with check (true);
create policy "Anyone can update" on songs for update using (true);
create policy "Anyone can delete" on songs for delete using (true);

-- Create storage buckets
insert into storage.buckets (id, name, public) 
values ('pdfs', 'pdfs', true), ('images', 'images', true)
on conflict do nothing;

-- Storage policies
create policy "Public can view PDFs" on storage.objects for select using (bucket_id = 'pdfs');
create policy "Anyone can upload PDFs" on storage.objects for insert with check (bucket_id = 'pdfs');
create policy "Anyone can delete PDFs" on storage.objects for delete using (bucket_id = 'pdfs');

create policy "Public can view images" on storage.objects for select using (bucket_id = 'images');
create policy "Anyone can upload images" on storage.objects for insert with check (bucket_id = 'images');
create policy "Anyone can delete images" on storage.objects for delete using (bucket_id = 'images');
```

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these values from: **Supabase Dashboard → Settings → API**

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- **Home**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Songs**: http://localhost:3000/songs

## 📁 Project Structure

```
music-platform/
├── app/
│   ├── admin/
│   │   └── page.js          # Admin dashboard
│   ├── songs/
│   │   └── page.js          # User frontend
│   ├── layout.js            # Root layout with PrimeReact
│   ├── providers.js         # PrimeReact provider
│   ├── page.js              # Home/test connection
│   └── globals.css          # Global styles
├── lib/
│   └── supabase.js          # Supabase client & helpers
├── .env.local               # Environment variables
└── package.json
```

## 🎨 Technologies Used

- **Next.js 14** - React framework with App Router
- **PrimeReact** - UI component library
- **Supabase** - Backend (database + storage)
- **Tailwind CSS** - Utility-first CSS

## 📝 Usage Guide

### Adding a Song (Admin)

1. Go to `/admin`
2. Click "Add New Song"
3. Fill in:
   - Title (required)
   - Artist (required)
   - Album (optional)
   - Genre (optional)
   - Description (optional)
   - YouTube URL (optional)
   - Cover Image (required - PNG/JPG)
   - PDF File (optional)
4. Click "Create Song"

### Browsing Songs (User)

1. Go to `/songs`
2. Search or filter by genre
3. Click on any song card to:
   - View full details
   - Watch YouTube video
   - Download PDF

## 🔒 Security Notes

**Current Setup**: Public access for testing

**For Production**:
1. Enable Supabase Authentication
2. Update RLS policies to check `auth.uid()`
3. Add admin role checks
4. Implement user sessions

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Verify variable names match exactly
- Restart dev server after adding env vars

### "Failed to upload file"
- Check storage buckets exist in Supabase
- Verify bucket names: `images` and `pdfs`
- Check RLS policies allow uploads

### Images not loading
- Verify buckets are set to `public: true`
- Check file uploaded successfully in Supabase Storage

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement playlist feature
- [ ] Add audio player for MP3 files
- [ ] Create artist profiles
- [ ] Add comments/ratings
- [ ] Implement advanced search

## 📄 License

MIT

---

**Built with ❤️ using Next.js, PrimeReact, and Supabase**