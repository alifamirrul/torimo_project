"""This app no longer uses Django ORM models for application data.

All meals, exercises, daily logs, notes, and profile records live in Supabase.
The Django backend now acts as a thin proxy over Supabase REST endpoints, so
we intentionally keep this module empty to avoid accidental migrations or
SQLite usage.
"""
