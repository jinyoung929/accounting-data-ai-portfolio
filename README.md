# 회계·데이터·AI 포트폴리오 CMS

프로젝트 콘텐츠, 이미지, 외부 자료를 직접 관리하고 공개하기 위한 React·Supabase 기반 개인 포트폴리오 웹서비스입니다.

- 서비스 데모 URL: https://accounting-data-ai-portfolio.vercel.app/

## Project Context

개발 프로젝트와 산출물을 단순 PDF나 로컬 파일로 관리하면 문제 정의, 해결 방식, 본인 역할, 기술 스택, 시연 자료를 일관되게 전달하기 어렵다고 판단했습니다.

이 프로젝트는 회계·데이터·AI 관련 포트폴리오를 지속적으로 관리하기 위한 개인 CMS입니다. 관리자 인증을 통해 프로젝트별 문제 정의, 해결 방식, 기술 스택, 대표 이미지, 아키텍처 이미지, GitHub, Notion, 시연 영상 링크를 직접 관리할 수 있도록 구현했습니다.

## My Role

- 서비스 기획 및 UI 구조 설계
- React, TypeScript, Vite 기반 프론트엔드 구현
- Supabase Auth, Database, Storage 연동
- 관리자 CMS 및 프로젝트 CRUD 구현
- Row Level Security 정책 설계
- 프로젝트 이미지 업로드 및 공개/임시저장 상태 관리
- GitHub/Vercel 기반 배포 환경 구성

## Why This Project Matters

포트폴리오 웹사이트 자체도 하나의 운영 시스템으로 설계했습니다. 단순 정적 페이지가 아니라 데이터베이스, 인증, 권한, 파일 저장소, 배포 흐름을 갖춘 관리형 서비스로 구현해 프로젝트 내용을 계속 업데이트할 수 있도록 만들었습니다.

이 과정에서 데이터 저장 구조, 접근 권한 통제, 파일 업로드, 배포 자동화 등 실제 업무 시스템을 구성할 때 필요한 기본 요소를 경험했습니다.

## 주요 기능

- 프로젝트 목록 및 상세 페이지 공개
- 관리자 로그인 및 권한 확인
- 프로젝트 추가·수정·삭제
- 공개/임시저장 상태 관리
- Supabase Database 기반 프로젝트 데이터 관리
- Supabase Storage 기반 대표 이미지 및 아키텍처 이미지 업로드
- Row Level Security 기반 접근 권한 통제
- Vercel 자동 배포

## 프로젝트 정보

- 프로젝트 기간: 2026.07
- 팀 규모: 1인 개인 프로젝트
- 프로젝트 유형: 개인 포트폴리오 CMS

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프론트엔드 | React, TypeScript, Vite, React Router, Tailwind CSS |
| 백엔드·DB | Supabase Auth, Supabase Database, Row Level Security |
| 파일 저장 | Supabase Storage |
| 배포·협업 | Vercel, GitHub |
