通过 prisma 客户端连接远程数据库：
```bash
POSTGRES_PRISMA_URL=postgres://neondb_owner:npg_kgw4Cn8SaATX@ep-square-water-a5yhu3cl.us-east-2.aws.neon.tech/neondb?sslmode=require pnpm exec prisma studio
```

然后访问 `http://localhost:5555/`