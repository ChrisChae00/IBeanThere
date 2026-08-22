-- =========================================================
-- Cafe Collections Feature - Database Schema
-- Created: 2026-02-04
-- Description: Tables for saving cafes to collections
-- =========================================================

-- =========================================================
-- 1. Create cafe_collections table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.cafe_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_type VARCHAR(20) NOT NULL DEFAULT 'custom', -- 'favourite', 'save_later', 'custom'
    color VARCHAR(7), -- Custom hex color (e.g., #FF5733)
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(32) UNIQUE, -- Unique token for sharing
    position INTEGER DEFAULT 0, -- For ordering collections
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.cafe_collections IS 'User-created collections for saving cafes (Favourites, Save for Later, custom lists)';

-- =========================================================
-- 2. Create collection_items table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    collection_id UUID NOT NULL REFERENCES public.cafe_collections (id) ON DELETE CASCADE,
    cafe_id UUID NOT NULL REFERENCES public.cafes (id) ON DELETE CASCADE,
    note TEXT, -- Personal note about this saved cafe
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (collection_id, cafe_id) -- Prevent duplicate entries
);

-- Add comment
COMMENT ON TABLE public.collection_items IS 'Junction table linking cafes to collections';

-- =========================================================
-- 3. Create indexes for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.cafe_collections (user_id);

CREATE INDEX IF NOT EXISTS idx_collections_share_token ON public.cafe_collections (share_token)
WHERE
    share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_collections_icon_type ON public.cafe_collections (user_id, icon_type);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.collection_items (collection_id);

CREATE INDEX IF NOT EXISTS idx_collection_items_cafe ON public.collection_items (cafe_id);

-- =========================================================
-- 4. Enable Row Level Security
-- =========================================================
ALTER TABLE public.cafe_collections ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 5. RLS Policies for cafe_collections
-- =========================================================

-- Users can view their own collections
CREATE POLICY "Users can view own collections" ON public.cafe_collections FOR
SELECT USING (auth.uid () = user_id);

-- Anyone can view public collections
CREATE POLICY "Anyone can view public collections" ON public.cafe_collections FOR
SELECT USING (is_public = true);

-- Anyone can access collections via share token (handled in API)
CREATE POLICY "Anyone can view shared collections by token" ON public.cafe_collections FOR
SELECT USING (share_token IS NOT NULL);

-- Users can create their own collections
CREATE POLICY "Users can create own collections" ON public.cafe_collections FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Users can update their own collections
CREATE POLICY "Users can update own collections" ON public.cafe_collections
FOR UPDATE
    USING (auth.uid () = user_id);

-- Users can delete their own collections
CREATE POLICY "Users can delete own collections" ON public.cafe_collections FOR DELETE USING (auth.uid () = user_id);

-- =========================================================
-- 6. RLS Policies for collection_items
-- =========================================================

-- Users can view items in collections they can access
CREATE POLICY "Users can view items in accessible collections" ON public.collection_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.cafe_collections c
            WHERE
                c.id = collection_items.collection_id
                AND (
                    c.user_id = auth.uid ()
                    OR c.is_public = true
                    OR c.share_token IS NOT NULL
                )
        )
    );

-- Users can add items to their own collections
CREATE POLICY "Users can add items to own collections" ON public.collection_items FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.cafe_collections c
            WHERE
                c.id = collection_items.collection_id
                AND c.user_id = auth.uid ()
        )
    );

-- Users can update items in their own collections
CREATE POLICY "Users can update items in own collections" ON public.collection_items
FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.cafe_collections c
            WHERE
                c.id = collection_items.collection_id
                AND c.user_id = auth.uid ()
        )
    );

-- Users can remove items from their own collections
CREATE POLICY "Users can delete items from own collections" ON public.collection_items FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.cafe_collections c
        WHERE
            c.id = collection_items.collection_id
            AND c.user_id = auth.uid ()
    )
);

-- =========================================================
-- 7. Create trigger for updated_at
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_collection_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_collection_updated_at
    BEFORE UPDATE ON public.cafe_collections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_collection_updated_at();

-- =========================================================
-- 8. Initial verification query
-- =========================================================
-- SELECT
--     tablename,
--     hasindexes,
--     hasrules,
--     hastriggers,
--     rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('cafe_collections', 'collection_items');