通过 prisma 客户端连接远程数据库：
```bash
POSTGRES_PRISMA_URL=postgres://neondb_owner:npg_kgw4Cn8SaATX@ep-square-water-a5yhu3cl.us-east-2.aws.neon.tech/neondb?sslmode=require pnpm exec prisma studio
```

然后访问 `http://localhost:5555/`

### 网站设计说明

- **部署网址：**https://learn-more-lovat.vercel.app/

*   **核心概念:**
    *   一个课程 (`Course`) 包含多个章节 (`Section`)。
    *   每个章节 (`Section`) 包含多个课时 (`Lesson`)。
*   **用户角色与权限:**
    *   系统定义了三种用户角色：学生 (`STUDENT`)、教育者 (`EDUCATOR`)、管理员 (`ADMIN`)。
    *   所有用户都可以在 `/profile` 页面查看并管理自己的基本信息。
    *   **学生 (`STUDENT`)**:
        *   **课程浏览与学习:**
            *   可以在课程市场 (`/courses`) 浏览所有已发布的课程。
            *   可以点击进入课程详情页 (`/course/[id]`) 查看课程介绍、章节和课时列表。
            *   可以选课（Enroll），选课后课程会出现在"我的课程"仪表盘 (`/dashboard`)。
            *   可以在课程详情页学习课时内容，并将课时标记为"已完成"。
        *   **学习进度:**
            *   "我的课程"仪表盘 (`/dashboard`) 会可视化展示已选课程的学习进度（基于已完成课时比例）。
        *   **订阅 (基础):**
            *   可以访问 `/pricing` 页面查看订阅计划信息。
    *   **教育者 (`EDUCATOR`)**:
        *   **课程管理:**
            *   可以通过教育者门户 (`/educator`) 查看自己创建的所有课程列表及其状态（草稿/已发布）、学生注册数等统计信息。
            *   可以创建新课程 (`/create`)，支持手动创建章节和课时，或通过上传指定格式的 CSV 文件批量创建课程结构。
            *   可以编辑已创建课程的基本信息、设置和封面图片 (`/course/[id]/edit`)。
            *   可以在教育者门户 (`/educator`) 或课程编辑页面 (`/course/[id]/edit` -> Settings) 发布或取消发布课程。
        *   **内容分享:**
            *   可以在课程编辑页面 (`/course/[id]/edit` -> Share) 获取课程的分享链接和二维码。
    *   **管理员 (`ADMIN`)**:
        *   **订阅管理:**
            *   可以访问管理员后台 (`/admin/subscriptions`) 查看和管理所有用户的订阅记录。
*   **主要页面:**
    *   `/`: 首页
    *   `/courses`: 课程市场 (公开课程列表)
    *   `/course/[id]`: 课程详情与学习页面
    *   `/dashboard`: 学生仪表盘 (我的课程与进度)
    *   `/profile`: 用户个人资料页
    *   `/pricing`: 定价/订阅计划页
    *   `/about`: 关于我们页面
    *   `/create`: 创建新课程页 (仅 Educator 可访问)
    *   `/educator`: 教育者门户 (仅 Educator 可访问)
    *   `/course/[id]/edit`: 编辑课程页 (仅课程作者 Educator 可访问)
    *   `/admin/subscriptions`: 订阅管理后台 (仅 Admin 可访问)
    *   `/login`, `/signup`: 登录与注册页
    *   `/playground`: 编程练习场 (可以在浏览器中直接编写和运行 Python 代码，支持测试用例)

- 已有的部分账号：
  - 学生：账号：student@example.com，密码：Password123!
  - 教育者：sarah.parker@example.com，密码：Password123!
  - 管理员：admin@example.com，密码：Password123!