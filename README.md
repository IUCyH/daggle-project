# 과제전형 리포지토리
## 아래 명령어를 참고하여 실행시키시면 됩니다.
~~~
공통
- 모든 명령어는 daggle-project 폴더에서 실행해야 합니다.

컨테이너 초기화(작동이 잘 안되시면 한번 해주시면 됩니다.)
docker-compose down -v

development 모드로 실행
- docker-compose up --build

production 모드로 실행
- docker-compose -f docker-compose.prod.yml up --build
~~~
## API URL: localhost:8080
## API 문서: localhost:8080/docs

# 핵심내용
- 토큰 재사용 방지를 위해 액세스 토큰에 jti 추가 및 관리
- 리프레시 토큰을 UUID로 만들어 간결화 및 리프레시 요청 시 아래 로직을 차례대로 수행해 검증
  - 클라이언트 -> 만료된 액세스 토큰, 리프레시 토큰 전달
  - DB에 똑같은 리프레시 토큰이 저장되어 있는 지 검사 -> 아니라면 거부
  - 리프레시 토큰의 유효기간(7일) 검사 -> 지났다면 거부
  - 액세스 토큰에서 유저 id 추출 후 리프레시 토큰으로 가져온 유저 id와 비교 -> 두 id가 다르다면 거부
  - 액세스 토큰 버전 검증 -> DB에 저장된 버전과 다르다면 거부
- 에러 핸들링
  - 통합적인 관리를 위해 Exception Filter를 만들어 한꺼번에 관리하였습니다.
  - DTO를 정의해 일관된 응답을 보내도록 구현하였습니다.
  - warn 로깅 및 파일 저장을 통해 추후에도 에러를 추적할 수 있도록 하였습니다.
