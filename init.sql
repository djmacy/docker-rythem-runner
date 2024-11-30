CREATE TABLE spotify_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    expires_in INT NOT NULL,
    refresh_token TEXT,
    created_at BIGINT
);