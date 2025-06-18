import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styled from 'styled-components';

// 스타일 컴포넌트 정의
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

const NoResult = styled.p`
  color: #999;
`;

const NearbyButton = styled.button`
  margin-top: 5px;
  padding: 5px 10px;
  font-size: 14px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

function ResultPage({ answers }) {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!answers || Object.keys(answers).length === 0) return;

    fetch('http://localhost:5000/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers)
    })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error(err));
  }, [answers]);

  return (
    <Container>
      <Card>
        <Title>추천 관광지 결과</Title>
        {results.length > 0 ? (
          <List>
            {results.map((item, index) => (
              <ListItem key={index}>
                <strong>{item.관광지명}</strong><br/>
                {item.소재지도로명주소}<br/>
                거리: {parseFloat(item['거리(km)']).toFixed(2)} km<br/>
                🚗 주차 가능 수: {item.주차가능수}<br/>
                <NearbyButton
                  onClick={() => {
                    if (item.위도 && item.경도) {
                      navigate('/nearby', {
                        state: {
                          latitude: item.위도,
                          longitude: item.경도
                        }
                      });
                    } else {
                      alert('위도/경도 정보가 없습니다.');
                    }
                  }}
                >
                  주변 탐색
                </NearbyButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <NoResult>추천 결과가 없습니다.</NoResult>
        )}
      </Card>
    </Container>
  );
}

export default ResultPage;
