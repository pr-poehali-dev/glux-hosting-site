import json
import os
import hashlib
import psycopg2


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def resp(status, body):
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(body, ensure_ascii=False)}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def make_token(user_id: int, username: str) -> str:
    raw = f'glux_user_{user_id}_{username}_secret'
    return hashlib.sha256(raw.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    '''Регистрация и вход пользователей Glux-Hosting'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    # Регистрация
    if action == 'register' and method == 'POST':
        username = (body.get('username') or '').strip()
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''
        tg = (body.get('tg_username') or '').strip()

        if not username or not email or not password:
            return resp(400, {'error': 'Заполните все обязательные поля'})
        if len(password) < 4:
            return resp(400, {'error': 'Пароль должен быть не менее 4 символов'})
        if len(username) < 3:
            return resp(400, {'error': 'Никнейм должен быть не менее 3 символов'})

        pw_hash = hash_pw(password)
        username_esc = username.replace("'", "''")
        email_esc = email.replace("'", "''")
        tg_esc = tg.replace("'", "''")

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM users WHERE username = '{username_esc}' OR email = '{email_esc}'")
        if cur.fetchone():
            cur.close()
            conn.close()
            return resp(409, {'error': 'Пользователь с таким именем или email уже существует'})

        cur.execute(
            f"INSERT INTO users (username, email, password_hash, tg_username) "
            f"VALUES ('{username_esc}', '{email_esc}', '{pw_hash}', '{tg_esc}') "
            f"RETURNING id, username, email, tg_username"
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        token = make_token(row[0], row[1])
        return resp(200, {
            'success': True,
            'token': token,
            'user': {'id': row[0], 'username': row[1], 'email': row[2], 'tg_username': row[3]}
        })

    # Вход
    if action == 'login' and method == 'POST':
        login = (body.get('login') or '').strip()
        password = body.get('password') or ''
        if not login or not password:
            return resp(400, {'error': 'Введите логин и пароль'})

        pw_hash = hash_pw(password)
        login_esc = login.replace("'", "''").lower()
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, username, email, tg_username FROM users "
            f"WHERE (LOWER(username) = '{login_esc}' OR LOWER(email) = '{login_esc}') "
            f"AND password_hash = '{pw_hash}'"
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return resp(401, {'error': 'Неверный логин или пароль'})
        token = make_token(row[0], row[1])
        return resp(200, {
            'success': True,
            'token': token,
            'user': {'id': row[0], 'username': row[1], 'email': row[2], 'tg_username': row[3]}
        })

    # Получить серверы пользователя
    if action == 'my_servers' and method == 'GET':
        user_id = params.get('user_id', '')
        token = (event.get('headers') or {}).get('X-User-Token', '')
        if not user_id or not token:
            return resp(403, {'error': 'Не авторизован'})
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, username FROM users WHERE id = {int(user_id)}")
        row = cur.fetchone()
        if not row or make_token(row[0], row[1]) != token:
            cur.close()
            conn.close()
            return resp(403, {'error': 'Не авторизован'})
        tg = row[1]
        cur.execute(
            f"SELECT id, server_name, plan, ip, rcon, ram, version, status, auto_restart "
            f"FROM hosts WHERE LOWER(tg_user) = LOWER('@{tg}') AND is_demo = false ORDER BY id DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        servers = [
            {'id': r[0], 'server_name': r[1], 'plan': r[2], 'ip': r[3],
             'rcon': r[4], 'ram': r[5], 'version': r[6], 'status': r[7], 'auto_restart': r[8]}
            for r in rows
        ]
        return resp(200, {'servers': servers})

    return resp(405, {'error': 'Method not allowed'})
