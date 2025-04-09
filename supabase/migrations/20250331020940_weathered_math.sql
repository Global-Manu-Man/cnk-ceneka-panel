/*
  # Real Estate Properties Schema

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `price` (text, required)
      - `image` (text, required)
      - `beds` (integer, required)
      - `baths` (integer, required)
      - `sqft` (integer, required)
      - `description` (text, required)
      - `features` (text[], required)
      - `location` (text, required)
      - `images` (text[], required)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on properties table
    - Add policies for CRUD operations based on user role
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'reader');

-- Create properties table
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price text NOT NULL,
  image text NOT NULL,
  beds integer NOT NULL,
  baths integer NOT NULL,
  sqft integer NOT NULL,
  description text NOT NULL,
  features text[] NOT NULL,
  location text NOT NULL,
  images text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create a function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (
      SELECT raw_user_meta_data->>'role'
      FROM auth.users
      WHERE id = auth.uid()
    )::user_role,
    'reader'::user_role
  );
$$;

-- Policies
CREATE POLICY "Allow read access for all authenticated users"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert for admin and editor"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Allow update for admin and editor"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (
    get_user_role() IN ('admin', 'editor')
  )
  WITH CHECK (
    get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "Allow delete for admin only"
  ON properties
  FOR DELETE
  TO authenticated
  USING (
    get_user_role() = 'admin'
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();