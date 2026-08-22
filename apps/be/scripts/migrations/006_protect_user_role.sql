-- Migration: Protect user role column from self-escalation
--
-- Problem: The existing UPDATE policy ("Users can update own profile") allows
-- authenticated users to update any column in their own row, including `role`.
-- This means a user could change their own role from 'user' to 'admin'.
--
-- Fix: Revoke column-level UPDATE permission on `role` from the `authenticated`
-- role. The `service_role` bypasses RLS and retains the ability to update roles.
--
-- Run this in the Supabase SQL editor or via the Supabase CLI.

REVOKE UPDATE (role) ON public.users FROM authenticated;
