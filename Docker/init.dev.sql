\c daggle_test

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(10) NOT NULL DEFAULT '',
    nickname VARCHAR(15) NULL DEFAULT NULL,
    email VARCHAR(128) NOT NULL DEFAULT '',
    password VARCHAR(128) NOT NULL DEFAULT '',
    deleted_at TIMESTAMP(1) WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS token_infos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    refresh_token VARCHAR(32) NOT NULL,
    access_token_version VARCHAR(32) NOT NULL,
    refresh_token_expires_at INTEGER NOT NULL,
    created_at TIMESTAMP(1) DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(32) NOT NULL,
    content VARCHAR(1024) NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    watch_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    deleted_at TIMESTAMP(1) WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS post_files (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    name VARCHAR(128) NOT NULL,
    url VARCHAR(256) NOT NULL,
    created_at TIMESTAMP(1) WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS post_photos (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    url VARCHAR(256) NOT NULL,
    created_at TIMESTAMP(1) WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS user_likes (
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    parent_id INTEGER NULL,
    content VARCHAR(64) NOT NULL,
    created_at TIMESTAMP(1) DEFAULT TIMEZONE('utc', NOW()),
    deleted_at TIMESTAMP(1) WITH TIME ZONE NULL
);