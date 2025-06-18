import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
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
  background-color: #f1f1f1;
  border-radius: 8px;
  text-align: left;
`;


function RoutePage() {
  const location = useLocation();
  const { routeData } = location.state || {};

  if (!routeData || routeData.status !== 'success') {
    return <Navigate to="/" />;
  }


  return (
    <Container>
      <Card>
        <Title>최적 경로 추천 결과</Title>
        <p>총 거리: {routeData.total_distance.toFixed(2)} km</p>
        <p>총 예상 시간: {routeData.total_time.toFixed(1)} 분</p>
        <List>
          {routeData.route.map((r, i) => (
            <ListItem key={i}>
              <strong>{r.name}</strong> - ({r.lat}, {r.lon}){' '}
              {typeof r.distance === 'number' && (
                <span>({r.distance.toFixed(2)} km)</span>
              )}
            </ListItem>
          ))}
        </List>
      </Card>

    </Container>
  );
}

export default RoutePage;
