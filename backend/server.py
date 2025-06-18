from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from math import radians, cos, sin, asin, sqrt
from collections import defaultdict, deque  # 자료구조: deque (경로 저장용)
import heapq  # 자료구조: 우선순위 큐 (A* 알고리즘에 사용)

app = Flask(__name__)
CORS(app)

# Input 데이터: 공공데이터포털: 전국관광지정보표준데이터 -> 전처리 후 places.csv 사용
places_df = pd.read_csv('places.csv')

# 거리 계산 함수 (Haversine 공식)
def haversine(lon1, lat1, lon2, lat2):
    R = 6371
    dlon, dlat = radians(lon2 - lon1), radians(lat2 - lat1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * asin(sqrt(a))
    return R * c

# 최단거리추천: Greedy 알고리즘 (가장 가까운 장소 5개 선택)
@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    lat, lon = data['latitude'], data['longitude']
    categories = data['categories']
    parking = data.get('parking', '아니오')

    filtered = places_df[places_df['category'].isin(categories)].copy()
    if parking == '예':
        filtered = filtered[filtered['주차가능수'] > 0]
    elif parking == '아니오':
        pass  
    else:
        pass  

    filtered['거리(km)'] = filtered.apply(
        lambda row: haversine(lon, lat, row['경도'], row['위도']), axis=1
    )

    # 알고리즘: Greedy (탐욕 알고리즘)
    recommended = []
    visited = set()
    for _ in range(5):
        min_dist = float('inf')
        best_index = -1
        for idx, row in filtered.iterrows():
            if idx in visited:
                continue
            if row['거리(km)'] < min_dist:
                min_dist = row['거리(km)']
                best_index = idx
        if best_index == -1:
            break
        visited.add(best_index)
        recommended.append(filtered.loc[best_index].to_dict())

    return jsonify(recommended)

# 최적경로탐색: DFS 백트래킹 알고리즘 (TSP)
@app.route('/api/nearby', methods=['POST'])
def nearby():
    data = request.json
    lat, lon = data.get('latitude'), data.get('longitude')
    radius_km = 30

    if lat is None or lon is None:
        return jsonify({'error': 'Invalid coordinates provided'}), 400

    nearby_df = places_df.copy()
    nearby_df['거리'] = nearby_df.apply(
        lambda row: haversine(lon, lat, row['경도'], row['위도']), axis=1)
    nearby_df = nearby_df[nearby_df['거리'] <= radius_km].reset_index(drop=True)

    if nearby_df.empty:
        return jsonify([])

    coords = nearby_df[['위도', '경도']].values
    n = len(coords)
    dist_matrix = [[haversine(coords[i][1], coords[i][0], coords[j][1], coords[j][0]) for j in range(n)] for i in range(n)]

    best_path = []
    min_cost = float('inf')

    # 알고리즘: DFS + 백트래킹
    def dfs(path, cost):
        nonlocal best_path, min_cost
        if len(path) == n:
            if cost < min_cost:
                min_cost = cost
                best_path = path[:]
            return
        last = path[-1]
        for i in range(n):
            if i not in path:
                dfs(path + [i], cost + dist_matrix[last][i])

    dfs([0], 0)

    tsp_route = nearby_df.iloc[best_path]
    return jsonify(tsp_route[['관광지명', '소재지도로명주소', '거리', '위도', '경도']].to_dict(orient='records'))

# 최적경로탐색: A* 알고리즘 (휴리스틱 기반 최소 경로 탐색)
@app.route('/api/route', methods=['POST'])
def route():
    data = request.json
    start = data.get('start')
    waypoints = data.get('waypoints', [])
    mode = data.get('mode', 'walking')
    speed_map = {'walking': 5, 'cycling': 15, 'driving': 50}
    speed = speed_map.get(mode, 5)

    waypoints = [wp for wp in waypoints if 'lat' in wp and 'lon' in wp]
    if not start or not waypoints:
        return jsonify({'status': 'error', 'message': 'start와 유효한 waypoints 필요'}), 400

    points = [start] + waypoints
    n = len(points)
    dist_matrix = [[haversine(points[i]['lon'], points[i]['lat'], points[j]['lon'], points[j]['lat']) for j in range(n)] for i in range(n)]

    # 알고리즘: A* 알고리즘 (우선순위 큐 + 휴리스틱 기반 탐색)
    def a_star(start_idx):
        open_set = [(0, [start_idx])]  # 자료구조: 우선순위 큐 (heapq)
        best_cost = float('inf')
        best_path = []
        while open_set:
            g, path = heapq.heappop(open_set)  # 가장 유망한 경로 pop
            current = path[-1]
            if len(path) == n:
                if g < best_cost:
                    best_cost = g
                    best_path = path
                continue
            for i in range(n):
                if i not in path:
                    h = min([dist_matrix[i][j] for j in range(n) if j not in path or j == 0])
                    heapq.heappush(open_set, (g + dist_matrix[current][i] + h, path + [i]))
        return best_path, best_cost

    order, total_distance = a_star(0)

    route = deque()  # 자료구조: deque (방문 경로 저장)
    route.append({"name": "출발지", "lat": start['lat'], "lon": start['lon']})
    for i in range(1, len(order)):
        prev, curr = order[i-1], order[i]
        d = dist_matrix[prev][curr]
        route.append({
            "name": points[curr].get("place_name", f"경유지{i}"),
            "lat": points[curr]['lat'],
            "lon": points[curr]['lon'],
            "distance": d
        })

    total_time = total_distance / speed * 60

    return jsonify({
        'status': 'success',
        'message': '최적 경로 추천 완료',
        'total_distance': round(total_distance, 2),
        'total_time': round(total_time, 2),
        'route': list(route)
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
