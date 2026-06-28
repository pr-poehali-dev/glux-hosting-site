CREATE TABLE IF NOT EXISTS hosts (
    id SERIAL PRIMARY KEY,
    tg_user VARCHAR(100) NOT NULL,
    server_name VARCHAR(200) NOT NULL,
    plan VARCHAR(20) NOT NULL DEFAULT 'IRON',
    ip VARCHAR(120) NOT NULL,
    rcon VARCHAR(80) NOT NULL,
    ram INTEGER NOT NULL DEFAULT 4096,
    version VARCHAR(20) NOT NULL DEFAULT '1.20.4',
    status VARCHAR(20) NOT NULL DEFAULT 'online',
    auto_restart BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO hosts (tg_user, server_name, plan, ip, rcon, ram, version, status, auto_restart) VALUES
('@steve', 'SkyBlock Survival', 'IRON', 'mc.glux.host:25565', 'rcon_a8f3k2', 4096, '1.20.4', 'online', true),
('@alex', 'Anarchy World', 'DIAMOND', 'anarchy.glux.host:25566', 'rcon_x91zp7', 8192, '1.20.1', 'offline', false);