import json
import os
import secrets
import string
import random
import psycopg2

ALLOWED_PLANS = {
    'STONE': {'ram': 2048},
    'IRON': {'ram': 4096},
    'DIAMOND': {'ram': 8192},
}


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def resp(status, body):
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(body), 'isBase64Encoded': False}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def admin_token():
    login = os.environ.get('ADMIN_LOGIN', '')
    password = os.environ.get('ADMIN_PASSWORD', '')
    return f'glux_{login}_{password}'


def gen_rcon():
    return 'rcon_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


def gen_ip():
    return f'srv{random.randint(100, 999)}.glux.host:255{random.randint(10, 99)}'


def serialize(row):
    return {
        'id': row[0], 'tg_user': row[1], 'server_name': row[2], 'plan': row[3],
        'ip': row[4], 'rcon': row[5], 'ram': row[6], 'version': row[7],
        'status': row[8], 'auto_restart': row[9],
    }


def handler(event: dict, context) -> dict:
    '''Управление хостингами и авторизация администратора Glux-Hosting'''
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

    # Авторизация — публичный эндпоинт
    if action == 'login' and method == 'POST':
        login = body.get('login', '')
        password = body.get('password', '')
        real_login = os.environ.get('ADMIN_LOGIN', '')
        real_password = os.environ.get('ADMIN_PASSWORD', '')
        if secrets.compare_digest(login, real_login) and secrets.compare_digest(password, real_password):
            return resp(200, {'success': True, 'token': admin_token()})
        return resp(401, {'success': False, 'error': 'Неверный логин или пароль'})

    # Все остальные действия требуют токен
    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token', '')
    if not secrets.compare_digest(token, admin_token()):
        return resp(403, {'error': 'Доступ запрещён'})

    conn = get_conn()
    cur = conn.cursor()

    if method == 'GET':
        cur.execute('SELECT id, tg_user, server_name, plan, ip, rcon, ram, version, status, auto_restart FROM hosts ORDER BY id DESC')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return resp(200, {'hosts': [serialize(r) for r in rows]})

    if method == 'POST':
        tg_user = (body.get('tg_user') or '').strip()
        server_name = (body.get('server_name') or '').strip()
        plan = body.get('plan', 'IRON')
        if not tg_user or not server_name:
            cur.close()
            conn.close()
            return resp(400, {'error': 'Укажите Telegram и название сервера'})
        if not tg_user.startswith('@'):
            tg_user = '@' + tg_user
        ram = ALLOWED_PLANS.get(plan, ALLOWED_PLANS['IRON'])['ram']
        ip = gen_ip()
        rcon = gen_rcon()
        tg_user = tg_user.replace("'", "''")
        server_name = server_name.replace("'", "''")
        cur.execute(
            f"INSERT INTO hosts (tg_user, server_name, plan, ip, rcon, ram, version, status, auto_restart) "
            f"VALUES ('{tg_user}', '{server_name}', '{plan}', '{ip}', '{rcon}', {ram}, '1.20.4', 'online', true) "
            f"RETURNING id, tg_user, server_name, plan, ip, rcon, ram, version, status, auto_restart"
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'host': serialize(row)})

    if method == 'PUT':
        host_id = int(body.get('id', 0))
        field = body.get('field', '')
        if field == 'rcon':
            new_rcon = gen_rcon()
            cur.execute(f"UPDATE hosts SET rcon = '{new_rcon}' WHERE id = {host_id}")
            conn.commit()
            cur.close()
            conn.close()
            return resp(200, {'rcon': new_rcon})
        if field == 'status':
            new_status = 'offline' if body.get('value') == 'offline' else 'online'
            cur.execute(f"UPDATE hosts SET status = '{new_status}' WHERE id = {host_id}")
            conn.commit()
            cur.close()
            conn.close()
            return resp(200, {'status': new_status})
        cur.close()
        conn.close()
        return resp(400, {'error': 'Неизвестное поле'})

    if method == 'DELETE':
        host_id = int(params.get('id', 0))
        cur.execute(f'DELETE FROM hosts WHERE id = {host_id}')
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'success': True})

    cur.close()
    conn.close()
    return resp(405, {'error': 'Method not allowed'})
