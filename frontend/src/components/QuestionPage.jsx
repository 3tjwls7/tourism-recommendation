import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const SubTitle = styled.h2`
  color: #666;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: ${({ selected }) => (selected ? 'lightgreen' : 'white')};
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background-color: ${({ selected }) => (selected ? '#90ee90' : '#f0f0f0')};
  }
`;

const NextButton = styled.button`
  padding: 10px 20px;
  background-color: ${({ disabled }) => (disabled ? '#ccc' : '#4CAF50')};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-size: 16px;
  &:hover {
    background-color: ${({ disabled }) => (disabled ? '#ccc' : '#45a049')};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

function QuestionPage({ saveAnswer }) {
  const { step } = useParams();
  const stepNum = parseInt(step);
  const navigate = useNavigate();

  const [categories] = useState([
    '문화', '체험', '기타', '전통', '레저/스포츠', '야경/전망대', '테마파크/놀이공원',
    '산책/휴식', '철도/교통 체험', '자연', '계절별 명소', '역사', '플라워/가드닝',
    '야외활동', '온천/스파', '과학/천문', '아이와 함께', '카페/디저트', '동물원/아쿠아리움'
  ]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [locationFetched, setLocationFetched] = useState(false);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleLocationFetch = () => {
    alert("현재 위치를 가져오는 중입니다...");
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        saveAnswer('latitude', lat);
        saveAnswer('longitude', lon);
        alert(`현재 위치: 위도 ${lat}, 경도 ${lon}`);
        setLocationFetched(true);
      },
      error => {
        alert("위치 정보를 가져올 수 없습니다.");
        console.error(error);
      }
    );
  };

  const handleNext = () => {
    if (stepNum === 1) {
      navigate('/question/2');
    } else if (stepNum === 2) {
      saveAnswer('categories', selectedCategories);
      navigate('/question/3');
    }
  };

  return (
    <Container>
      <Card>
        <Title>관광지 추천 서비스</Title>
        {stepNum === 1 && (
          <>
            <SubTitle>먼저 현재 위치를 가져와 주세요</SubTitle>
            <ButtonGroup>
              <NextButton onClick={handleLocationFetch}>현재 위치 가져오기</NextButton>
              <NextButton onClick={handleNext} disabled={!locationFetched}>다음</NextButton>
            </ButtonGroup>
          </>
        )}

        {stepNum === 2 && (
          <>
            <SubTitle>관심있는 카테고리를 선택하세요 (중복 선택 가능)</SubTitle>
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => toggleCategory(category)}
                selected={selectedCategories.includes(category)}
              >
                {category}
              </Button>
            ))}
            <NextButton onClick={handleNext} style={{ marginTop: '20px' }}>다음</NextButton>
          </>
        )}

        {stepNum === 3 && (
          <>
            <SubTitle>주차장이 필요한가요?</SubTitle>
            <Button onClick={() => { saveAnswer('parking', '예'); navigate('/result'); }}>예</Button>
            <Button onClick={() => { saveAnswer('parking', '아니오'); navigate('/result'); }}>아니오</Button>
          </>
        )}
      </Card>
    </Container>
  );
}

export default QuestionPage;
