# Word relay Game (Express, Socket.io, NAVER dictionary API )

[끝말잇기 게임 진행 이미지]

## 프로젝트 기능
1. 회원가입
2. 로그인
3. 게임 생성
4. 외부 인원 참여 (최대 3명)
5. 게임 시작 (끝말잇기 게임)
6. 게임 종료
7. 마이페이지, 고객문의

## 프로젝트 실행
1. npm i
2. config/config.json 에서 자신의 DB연결
3. .env 에서  포트, SECRET 키 설정
4. app.js에서 client_id, client_secret 변수를 자신의 API 키로 설정   
   [오픈 API 이용 신청 URL](https://developers.naver.com/apps/#/register?defaultScope=search)
5. npm start




## 미해결 사항
>1. 게임 리스트 문제    
(모든 인원이 다 찬 방을 다른 사용자가 확인 하지 못하도록 삭제)
>2. 게임 문제   
(두음 법칙 적용 예외 , 게임 진행 순서에 따른 진행 순서 랜덤 문제)
>3. DB association 문제   
(DB 1:1 , 1:N Association 문제 해결 필요)
>4. 고객센터 기능 미완성   
(고객 센터 답장 관련 관리자 페이지 미완)
    
