<div style="display:flex; flex-direction:column; gap:10px;">
    <div align="center" style="font-size: 40px;"><strong>Quickz</strong></div>
    <div align="center" style="font-weight:400; margin-top:10px">A simple web application to distribute, answer and manage quizzes</div>
    <div align="center" style="font-weight:400">
        <img src="https://img.shields.io/badge/License-MIT%20License-purple" alt="Static Badge" style="width:20%"/>
    </div>
</div>



## Introduction

`Quickz` is a simple application that allows admins to distribute and manage quizzes to members in their organization and users to answer the assigned quizzes.

## Manual

### For admin

- Click “I am an admin” to register an admin account first.
- Login to your account.
- Create your question bank in  `/admin/questions` 
- Manage your organization’s members in `/admin/members`
- Create a quiz and see its details in `/admin`  (Note : If you select “All guests” when creating the quiz, it means that everyone, with or without an account, will be above to answer this quiz. However, only your members’ answer sheets will be saved.)

### For user

- Click “I am a user” to register a user account first. (Note : You need your organization’s secret key to register, which would be randomly generated when your admin registers his/her account and can be obtained from him/her.)
- Login to your account.
- Answer quizzes, view archived answer sheets in `/user`.

## Deploy on your own

- Create a vercel project on vercel dashboard. 

- Replace `POSTGRES_URL` in `.env` with your own Postgres URL.

- Run

  ```bash
  npm i -g vercel
  vercel link
  vercel env pull
  ```
  
- Run

  ```bash
  pnpm install
  pnpm dev
  ```

## Acknowledgements

- Website is hosted by [vercel](https://vercel.com).
- Database is provided by [neon.](https://neon.tech/)
- UI components are from [shadcn/ui](https://ui.shadcn.com/).
- Icons are from [Lucide](https://lucide.dev/icons/).
- Localization is supported by [i18next](https://www.i18next.com/)

