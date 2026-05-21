import os, requests, time
from dotenv import load_dotenv
load_dotenv()

print('Testing full agent call (same payload as Expo app)...')
start = time.time()

res = requests.post(
    'http://192.168.1.16:5000/api/agent/process',
    json={
        'message': 'I need a plumber',
        'user_id': '9bf8cfbf-ee00-49e8-84a1-7d7df2a6db78',
        'mode': 'customer'
    },
    timeout=60
)
elapsed = time.time() - start
print(f'Status: {res.status_code} | Time: {elapsed:.1f}s')

data = res.json()
history = data.get('history', [])
print(f'History items: {len(history)}')

for item in history:
    role = item.get('role')
    if role == 'system':
        continue
    content = str(item.get('content', ''))[:120]
    tool_calls = item.get('tool_calls')
    if tool_calls:
        print(f'  [{role}] (tool_call): {tool_calls[0]["function"]["name"]}')
    else:
        print(f'  [{role}]: {content}')

print()
print('response field:', str(data.get('response', ''))[:300])
