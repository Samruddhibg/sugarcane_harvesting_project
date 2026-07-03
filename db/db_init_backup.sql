CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  district VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'machine', 'factory')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  phone VARCHAR(15),
  district VARCHAR(100),
  role VARCHAR(20),
  msg TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE factories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  district VARCHAR(100),
  owner_user_id INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE farmer_profile (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  phone VARCHAR(15),
  district VARCHAR(100),
  factory_id INT REFERENCES factories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE f_register (
  id SERIAL PRIMARY KEY,
  farmer_id INT REFERENCES farmer_profile(id) ON DELETE CASCADE,
  factory_id INT REFERENCES factories(id) ON DELETE CASCADE,
  name VARCHAR(100),
  phone VARCHAR(15),
  district VARCHAR(100),
  address TEXT,
  planting_date DATE NOT NULL,
  crop_size NUMERIC NOT NULL,
  submission_date TIMESTAMP DEFAULT now(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'rejected', 'finished'))
);

CREATE TABLE machine_profile (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  phone VARCHAR(15),
  district VARCHAR(100),
  factory_id INT REFERENCES factories(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'reserved', 'busy')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE m_register (
  id SERIAL PRIMARY KEY,
  machine_id INT REFERENCES machine_profile(id) ON DELETE CASCADE,
  factory_id INT REFERENCES factories(id) ON DELETE CASCADE,
  name VARCHAR(100),
  phone VARCHAR(15),
  district VARCHAR(100),
  submission_date TIMESTAMP DEFAULT now()
);

CREATE TABLE assignment_request (
  id SERIAL PRIMARY KEY,
  factory_id INT REFERENCES factories(id) ON DELETE CASCADE,
  f_register_id INT REFERENCES f_register(id) ON DELETE CASCADE,
  farmer_id INT REFERENCES farmer_profile(id) ON DELETE CASCADE,
  machine_id INT REFERENCES machine_profile(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  requested_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  responded_at TIMESTAMP
);

CREATE TABLE confirmed_assignment (
  id SERIAL PRIMARY KEY,
  factory_id INT REFERENCES factories(id) ON DELETE CASCADE,
  farmer_id INT REFERENCES farmer_profile(id) ON DELETE CASCADE,
  machine_id INT REFERENCES machine_profile(id) ON DELETE CASCADE,
  f_register_id INT REFERENCES f_register(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'finished')),
  assigned_at TIMESTAMP DEFAULT now(),
  finished_at TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  factory_id INT REFERENCES factories(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX one_pending_request_per_register
  ON assignment_request (f_register_id) WHERE status = 'pending';

CREATE INDEX idx_f_register_priority_matching 
  ON f_register (factory_id, status, planting_date ASC, crop_size ASC);

CREATE INDEX idx_machine_profile_matching 
  ON machine_profile (factory_id, status);
