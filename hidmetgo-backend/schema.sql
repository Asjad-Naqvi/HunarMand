-- ============================================================
-- HUNARMAND — Supabase PostgreSQL Schema
-- Generated from Project Plan V2 (Files 01–08)
-- ============================================================

-- ====================
-- 1. CUSTOM ENUM TYPES
-- ====================

CREATE TYPE user_role AS ENUM ('consumer', 'provider');

CREATE TYPE preferred_time AS ENUM ('morning', 'afternoon', 'evening');

CREATE TYPE loyalty_tier AS ENUM ('none', 'bronze', 'silver', 'gold');

CREATE TYPE availability_status AS ENUM (
  'available', 'unavailable', 'search_hidden', 'suspended', 'blacklisted'
);

CREATE TYPE account_status AS ENUM (
  'active', 'suspended', 'search_hidden', 'blacklisted'
);

CREATE TYPE complexity_tier AS ENUM ('basic', 'intermediate', 'complex');

CREATE TYPE urgency_level AS ENUM ('same_day', 'next_day', 'scheduled');

CREATE TYPE booking_status AS ENUM (
  'pending_provider_acceptance',
  'confirmed',
  'provider_on_the_way',
  'en_route',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'expired',
  'disputed'
);

CREATE TYPE reviewer_role AS ENUM ('consumer', 'provider');

CREATE TYPE decline_reason AS ENUM ('declined', 'timeout');

CREATE TYPE dispute_type AS ENUM ('DIS-01', 'DIS-02', 'DIS-03', 'DIS-04');

CREATE TYPE dispute_status AS ENUM ('under_review', 'resolved');

CREATE TYPE verdict_code AS ENUM ('VRD-01', 'VRD-02', 'VRD-03', 'VRD-04', 'VRD-05');

CREATE TYPE advisor_card_type AS ENUM (
  'gap_opportunity', 'demand_forecast', 'rating_alert',
  'availability_reminder', 'nonresponse_warning'
);


-- ====================
-- 2. CORE TABLES
-- ====================

-- 2.1 Users (shared auth table — consumer & provider)
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone            TEXT UNIQUE NOT NULL,
  email            TEXT UNIQUE,
  name             TEXT,
  role             user_role NOT NULL,
  expo_push_token  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  users IS 'Shared user table for both consumers and providers. Password managed by Supabase Auth.';
COMMENT ON COLUMN users.phone IS 'Primary login identifier. Contact field only — no OTP.';
COMMENT ON COLUMN users.expo_push_token IS 'Updated on every login for FCM delivery via Expo.';


-- 2.2 Consumer Profiles
CREATE TABLE consumer_profiles (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_time      preferred_time,
  consumer_rating_avg FLOAT DEFAULT 0,
  dispute_flag        BOOLEAN NOT NULL DEFAULT FALSE,
  total_completed     INT NOT NULL DEFAULT 0,
  loyalty_tier        loyalty_tier NOT NULL DEFAULT 'none'
);

COMMENT ON COLUMN consumer_profiles.loyalty_tier IS 'Derived: none 0-2, bronze 3-7, silver 8-14, gold 15+.';
COMMENT ON COLUMN consumer_profiles.dispute_flag IS 'Set to TRUE by verdict VRD-05. Shown to providers on job request cards.';


-- 2.3 Consumer Addresses
CREATE TABLE consumer_addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,          -- e.g. "Home", "Office"
  display_name TEXT,
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consumer_addresses_user ON consumer_addresses(user_id);


-- 2.4 Consumer Favourites
CREATE TABLE consumer_favourites (
  consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (consumer_id, provider_id)
);


-- 2.5 Provider Profiles
CREATE TABLE provider_profiles (
  user_id                  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  location_lat             DOUBLE PRECISION,
  location_lng             DOUBLE PRECISION,
  availability_status      availability_status NOT NULL DEFAULT 'available',
  base_rating              FLOAT DEFAULT 0,
  punctuality_rating       FLOAT DEFAULT 0,
  quality_rating           FLOAT DEFAULT 0,
  behaviour_rating         FLOAT DEFAULT 0,
  jobs_completed           INT NOT NULL DEFAULT 0,
  cancellation_rate        FLOAT NOT NULL DEFAULT 0,
  dispute_score            FLOAT NOT NULL DEFAULT 1.0,
  total_earnings_simulated INT NOT NULL DEFAULT 0,   -- PKR, includes HunarMand loyalty subsidy
  account_status           account_status NOT NULL DEFAULT 'active',
  suspension_until         TIMESTAMPTZ,
  member_since             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN provider_profiles.dispute_score IS 'Starts at 1.0. Penalised by disputes and non-responses. Used in matching algorithm.';
COMMENT ON COLUMN provider_profiles.total_earnings_simulated IS 'Simulated cumulative PKR earnings including HunarMand loyalty subsidy contributions.';


-- 2.6 Provider Services (one row per service the provider offers)
CREATE TABLE provider_services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_code     TEXT NOT NULL,       -- e.g. HS-04, CS-02
  per_job_rate_pkr INT NOT NULL,
  is_primary       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX idx_provider_services_code     ON provider_services(service_code);


-- 2.7 Provider Sectors
CREATE TABLE provider_sectors (
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sector_code TEXT NOT NULL,            -- e.g. G-13, F-8
  PRIMARY KEY (provider_id, sector_code)
);


-- 2.8 Provider Availability (weekly schedule)
CREATE TABLE provider_availability (
  provider_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week  INT  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Mon … 6=Sun
  open_time    TIME NOT NULL,
  close_time   TIME NOT NULL,
  PRIMARY KEY (provider_id, day_of_week)
);


-- 2.9 Provider Non-Responses
CREATE TABLE provider_nonresponses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id      UUID NOT NULL,  -- FK added after bookings table creation
  expired_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  penalty_applied BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_nonresponses_provider ON provider_nonresponses(provider_id);


-- 2.10 Bookings
CREATE TABLE bookings (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id                 UUID NOT NULL REFERENCES users(id),
  provider_id                 UUID REFERENCES users(id),
  service_code                TEXT NOT NULL,
  complexity_tier             complexity_tier NOT NULL DEFAULT 'basic',
  consumer_address_id         UUID REFERENCES consumer_addresses(id),
  requested_date              DATE NOT NULL,
  requested_time_slot         TIME NOT NULL,
  urgency                     urgency_level NOT NULL DEFAULT 'scheduled',
  budget_sensitive            BOOLEAN NOT NULL DEFAULT FALSE,
  base_rate_pkr               INT NOT NULL DEFAULT 0,
  price_breakdown             JSONB,
  pre_discount_estimate_pkr   INT NOT NULL DEFAULT 0,
  loyalty_discount_pkr        INT NOT NULL DEFAULT 0,
  loyalty_tier_applied        loyalty_tier NOT NULL DEFAULT 'none',
  final_estimate_pkr          INT NOT NULL DEFAULT 0,
  hunarmand_subsidy_pkr          INT NOT NULL DEFAULT 0,
  status                      booking_status NOT NULL DEFAULT 'pending_provider_acceptance',
  reminder_consumer_3h_sent   BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_consumer_1h_sent   BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_provider_24h_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_provider_2h_sent   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at                TIMESTAMPTZ,
  completed_at                TIMESTAMPTZ
);

CREATE INDEX idx_bookings_consumer ON bookings(consumer_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status   ON bookings(status);
CREATE INDEX idx_bookings_service  ON bookings(service_code, created_at);

-- Now add the FK from provider_nonresponses → bookings
ALTER TABLE provider_nonresponses
  ADD CONSTRAINT fk_nonresponses_booking
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;


-- 2.11 Booking Declined Providers
CREATE TABLE booking_declined_providers (
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES users(id),
  reason      decline_reason NOT NULL,
  declined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (booking_id, provider_id)
);


-- 2.12 Reviews
CREATE TABLE reviews (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id             UUID NOT NULL REFERENCES bookings(id),
  reviewer_id            UUID NOT NULL REFERENCES users(id),
  reviewee_id            UUID NOT NULL REFERENCES users(id),
  reviewer_role          reviewer_role NOT NULL,
  overall_rating         INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 10),
  punctuality_rating     INT CHECK (punctuality_rating BETWEEN 1 AND 10),
  quality_rating         INT CHECK (quality_rating BETWEEN 1 AND 10),       -- consumer → provider
  behaviour_rating       INT CHECK (behaviour_rating BETWEEN 1 AND 10),     -- consumer → provider
  cooperativeness_rating INT CHECK (cooperativeness_rating BETWEEN 1 AND 10), -- provider → consumer
  payment_rating         INT CHECK (payment_rating BETWEEN 1 AND 10),       -- provider → consumer
  review_text            TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_booking  ON reviews(booking_id);


-- 2.13 Disputes
CREATE TABLE disputes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES bookings(id),
  raised_by_id      UUID NOT NULL REFERENCES users(id),
  raised_by_role    reviewer_role NOT NULL,
  dispute_type      dispute_type NOT NULL,
  description_json  JSONB,              -- structured answers from agent chat
  status            dispute_status NOT NULL DEFAULT 'under_review',
  verdict           verdict_code,
  verdict_reasoning TEXT,
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_disputes_booking ON disputes(booking_id);
CREATE INDEX idx_disputes_raised  ON disputes(raised_by_id);


-- 2.14 AI Advisor Cards (provider dashboard feed)
CREATE TABLE advisor_cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_type        advisor_card_type NOT NULL,
  headline         TEXT NOT NULL,
  detail           TEXT NOT NULL,
  deep_link_action TEXT,
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_advisor_cards_provider ON advisor_cards(provider_id, generated_at DESC);


-- 2.15 Surge Flags
CREATE TABLE surge_flags (
  service_code    TEXT NOT NULL,
  sector_code     TEXT NOT NULL,
  is_surge_active BOOLEAN NOT NULL DEFAULT FALSE,
  request_count   INT NOT NULL DEFAULT 0,
  window_start    TIMESTAMPTZ,
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (service_code, sector_code)
);


-- 2.16 Google Maps Providers (Mock Data)
CREATE TABLE gmaps_providers_mock (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name   TEXT NOT NULL,
  category        TEXT NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  sector_code     TEXT,
  google_rating   FLOAT,
  review_count    INT DEFAULT 0,
  sentiment_score FLOAT DEFAULT 0.5,
  phone           TEXT,
  is_open         BOOLEAN NOT NULL DEFAULT TRUE,
  is_simulated    BOOLEAN NOT NULL DEFAULT TRUE
);


-- ============================================================
-- 3. HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- 3.1 Auto-derive loyalty_tier from total_completed
CREATE OR REPLACE FUNCTION fn_update_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.loyalty_tier := CASE
    WHEN NEW.total_completed >= 15 THEN 'gold'
    WHEN NEW.total_completed >= 8  THEN 'silver'
    WHEN NEW.total_completed >= 3  THEN 'bronze'
    ELSE 'none'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loyalty_tier
  BEFORE INSERT OR UPDATE OF total_completed
  ON consumer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_loyalty_tier();


-- 3.2 After a consumer→provider review, update provider rating averages
CREATE OR REPLACE FUNCTION fn_update_provider_ratings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reviewer_role = 'consumer' THEN
    UPDATE provider_profiles SET
      base_rating        = sub.avg_overall,
      punctuality_rating = sub.avg_punctuality,
      quality_rating     = sub.avg_quality,
      behaviour_rating   = sub.avg_behaviour
    FROM (
      SELECT
        AVG(overall_rating)::FLOAT     AS avg_overall,
        AVG(punctuality_rating)::FLOAT AS avg_punctuality,
        AVG(quality_rating)::FLOAT     AS avg_quality,
        AVG(behaviour_rating)::FLOAT   AS avg_behaviour
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND reviewer_role = 'consumer'
    ) sub
    WHERE user_id = NEW.reviewee_id;
  END IF;

  -- After a provider→consumer review, update consumer_rating_avg
  IF NEW.reviewer_role = 'provider' THEN
    UPDATE consumer_profiles SET
      consumer_rating_avg = sub.avg_overall
    FROM (
      SELECT AVG(overall_rating)::FLOAT AS avg_overall
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
        AND reviewer_role = 'provider'
    ) sub
    WHERE user_id = NEW.reviewee_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_ratings
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_provider_ratings();


-- 3.3 On booking completion, increment consumer total_completed & provider jobs_completed
CREATE OR REPLACE FUNCTION fn_on_booking_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    NEW.completed_at := now();

    UPDATE consumer_profiles
      SET total_completed = total_completed + 1
      WHERE user_id = NEW.consumer_id;

    UPDATE provider_profiles
      SET jobs_completed = jobs_completed + 1,
          total_earnings_simulated = total_earnings_simulated
                                     + NEW.final_estimate_pkr
                                     + NEW.hunarmand_subsidy_pkr
      WHERE user_id = NEW.provider_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_completed
  BEFORE UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION fn_on_booking_completed();


-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_addresses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_favourites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_sectors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability    ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_nonresponses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_declined_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_cards            ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Consumer profiles: own row
CREATE POLICY cp_select_own ON consumer_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cp_update_own ON consumer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Consumer addresses: own rows
CREATE POLICY ca_all_own ON consumer_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Provider profiles: anyone can read (for matching), owner can update
CREATE POLICY pp_select_all ON provider_profiles
  FOR SELECT USING (TRUE);
CREATE POLICY pp_update_own ON provider_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Provider services: anyone can read, owner can manage
CREATE POLICY ps_select_all ON provider_services
  FOR SELECT USING (TRUE);
CREATE POLICY ps_manage_own ON provider_services
  FOR ALL USING (auth.uid() = provider_id);

-- Provider sectors: anyone can read, owner can manage
CREATE POLICY psec_select_all ON provider_sectors
  FOR SELECT USING (TRUE);
CREATE POLICY psec_manage_own ON provider_sectors
  FOR ALL USING (auth.uid() = provider_id);

-- Provider availability: anyone can read, owner can manage
CREATE POLICY pa_select_all ON provider_availability
  FOR SELECT USING (TRUE);
CREATE POLICY pa_manage_own ON provider_availability
  FOR ALL USING (auth.uid() = provider_id);

-- Bookings: consumer or provider on the booking can read
CREATE POLICY bk_select_own ON bookings
  FOR SELECT USING (auth.uid() = consumer_id OR auth.uid() = provider_id);

-- Reviews: anyone can read, reviewer can insert
CREATE POLICY rv_select_all ON reviews
  FOR SELECT USING (TRUE);
CREATE POLICY rv_insert_own ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Advisor cards: own provider
CREATE POLICY ac_select_own ON advisor_cards
  FOR SELECT USING (auth.uid() = provider_id);


-- ============================================================
-- 5. SERVICE CATALOGUE REFERENCE TABLE (read-only)
-- ============================================================

CREATE TABLE service_catalogue (
  service_code     TEXT PRIMARY KEY,
  category         TEXT NOT NULL,         -- 'home_services' | 'cleaning_services'
  service_name     TEXT NOT NULL,
  default_complexity complexity_tier NOT NULL DEFAULT 'basic'
);

INSERT INTO service_catalogue (service_code, category, service_name, default_complexity) VALUES
  ('HS-01', 'home_services',     'AC Installation',              'intermediate'),
  ('HS-02', 'home_services',     'AC Dismounting',               'intermediate'),
  ('HS-03', 'home_services',     'AC General Service',           'basic'),
  ('HS-04', 'home_services',     'AC Repairing',                 'intermediate'),
  ('HS-05', 'home_services',     'Carpenter Work',               'intermediate'),
  ('HS-06', 'home_services',     'Electrician',                  'basic'),
  ('HS-07', 'home_services',     'Gas Geyser Installation',      'intermediate'),
  ('HS-08', 'home_services',     'Gas Geyser Dismounting',       'intermediate'),
  ('HS-09', 'home_services',     'Gas Geyser Repairing',         'intermediate'),
  ('HS-10', 'home_services',     'Electric Geyser Installation', 'intermediate'),
  ('HS-11', 'home_services',     'Electric Geyser Dismounting',  'intermediate'),
  ('HS-12', 'home_services',     'Electric Geyser Repairing',    'intermediate'),
  ('HS-13', 'home_services',     'Painter',                      'intermediate'),
  ('HS-14', 'home_services',     'Plumber',                      'basic'),
  ('HS-15', 'home_services',     'Water Tank Installation',      'complex'),
  ('CS-01', 'cleaning_services', 'Solar Panel Cleaning',         'basic'),
  ('CS-02', 'cleaning_services', 'Sofa Cleaning',                'basic'),
  ('CS-03', 'cleaning_services', 'Plastic Water Tank Cleaning',  'basic'),
  ('CS-04', 'cleaning_services', 'Cement Water Tank Cleaning',   'basic'),
  ('CS-05', 'cleaning_services', 'Carpet Cleaning',              'basic'),
  ('CS-06', 'cleaning_services', 'Bed/Mattress Cleaning',        'basic'),
  ('CS-07', 'cleaning_services', 'Curtain Cleaning',             'basic');
