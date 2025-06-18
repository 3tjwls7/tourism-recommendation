import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f9f9f9;
  font-family: 'Arial', sans-serif;
`;

const Card = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 90%;
  max-width: 600px;
  text-align: center;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  margin-bottom: 10px;
  padding: 10px;
  background-color: ${({ selected }) => (selected ? '#90ee90' : '#f1f1f1')};
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
`;

const NoResult = styled.p`
  color: #999;
`;

const Button = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

function NearbyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const latitude = location?.state?.latitude;
  const longitude = location?.state?.longitude;

  const [nearby, setNearby] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  useEffect(() => {
    if (latitude && longitude) {
      console.log(" NearbyPage - 위도:", latitude, "경도:", longitude);

      fetch('http://localhost:5000/api/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude })
      })
        .then(res => res.json())
        .then(data => setNearby(data))
        .catch(err => {
          console.error("/api/nearby 오류:", err);
          alert("주변 관광지 요청 중 오류가 발생했습니다.");
        });
    }
  }, [latitude, longitude]);

  const toggleSelect = (place) => {
    setSelectedPlaces(prev =>
      prev.includes(place.관광지명)
        ? prev.filter(p => p !== place.관광지명)
        : [...prev, place.관광지명]
    );
  };

  const handleFinalRoute = () => {
    if (selectedPlaces.length === 0) {
      alert('최소 한 개의 관광지를 선택해주세요.');
      return;
    }

    const waypoints = nearby
      .filter(n =>
        selectedPlaces.includes(n.관광지명) &&
        typeof n.위도 === 'number' &&
        typeof n.경도 === 'number' &&
        !isNaN(n.위도) &&
        !isNaN(n.경도)
      )
      .map(p => ({
        lat: p.위도,
        lon: p.경도,
        place_name: p.관광지명  
      }));

    if (waypoints.length === 0) {
      alert('선택한 관광지의 위치 정보가 부족합니다.');
      return;
    }

    fetch('http://localhost:5000/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: { lat: latitude, lon: longitude },
        waypoints,
        mode: 'driving'
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.message || '서버 오류 발생');
          });
        }
        return res.json();
      })
      .then(data => {
        navigate('/route', { state: { routeData: data } });
      })
      .catch(err => {
        console.error(err);
        alert('경로 추천 요청 중 오류가 발생했습니다: ' + err.message);
      });
  };

  if (!latitude || !longitude) {
    return (
      <Container>
        <Card>
          <Title>좌표 정보 없음</Title>
          <NoResult>잘못된 접근입니다. 홈으로 돌아가 주세요.</NoResult>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Title>주변 관광지 추천</Title>
        {nearby.length > 0 ? (
          <>
            <List>
              {nearby.map((n, i) => (
                <ListItem
                  key={i}
                  selected={selectedPlaces.includes(n.관광지명)}
                  onClick={() => toggleSelect(n)}
                >
                  {n.관광지명} - {n.소재지도로명주소} ({parseFloat(n.거리).toFixed(2)} km)
                </ListItem>
              ))}
            </List>
            <Button onClick={handleFinalRoute}>최적 경로 추천</Button>
          </>
        ) : (
          <NoResult>주변 추천 결과가 없습니다.</NoResult>
        )}
      </Card>
    </Container>
  );
}

export default NearbyPage;
